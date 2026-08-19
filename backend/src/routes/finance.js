const express = require('express');
const router = express.Router();

function money(value) { return Number(Number(value || 0).toFixed(2)); }

module.exports = function financeRoutes(pool, auth) {
  router.get('/summary', auth(['ADMIN','STAFF']), async (_req,res) => {
    try {
      const [[row]] = await pool.query(`SELECT COALESCE(SUM(total_amount),0) invoiced, COALESCE(SUM(amount_paid),0) collected, COALESCE(SUM(balance_due),0) outstanding, COALESCE(SUM(CASE WHEN status='OVERDUE' THEN balance_due ELSE 0 END),0) overdue FROM invoices WHERE status <> 'VOID'`);
      res.json(row);
    } catch (_e) { res.status(500).json({error:'Unable to load finance summary.'}); }
  });

  router.get('/invoices', auth(['ADMIN','STAFF']), async (_req,res) => {
    try { const [rows] = await pool.query(`SELECT i.id,i.invoice_number,i.issue_date,i.due_date,i.status,i.total_amount,i.amount_paid,i.balance_due,c.name client_name FROM invoices i JOIN clients c ON c.id=i.client_id ORDER BY i.created_at DESC`); res.json(rows); }
    catch (_e) { res.status(500).json({error:'Unable to load invoices.'}); }
  });

  router.post('/invoices', auth(['ADMIN','STAFF']), async (req,res) => {
    const {client_id,request_id=null,quotation_id=null,invoice_number,issue_date,due_date=null,items=[],tax_rate=0,discount_amount=0,notes=null}=req.body;
    if(!client_id || !invoice_number || !issue_date || !Array.isArray(items) || !items.length) return res.status(400).json({error:'Client, invoice number, issue date and at least one item are required.'});
    const connection=await pool.getConnection();
    try { await connection.beginTransaction(); let subtotal=0; const normalized=items.map(x=>{const quantity=Number(x.quantity||0), unit_price=Number(x.unit_price||0); const line_total=money(quantity*unit_price); subtotal+=line_total; return {description:String(x.description||'').trim(),quantity,unit_price,line_total};}); if(normalized.some(x=>!x.description||x.quantity<=0||x.unit_price<0)) throw new Error('Invalid invoice item.'); const tax=money((subtotal-money(discount_amount))*Number(tax_rate||0)/100); const total=money(subtotal-money(discount_amount)+tax); const [r]=await connection.execute(`INSERT INTO invoices(client_id,request_id,quotation_id,invoice_number,issue_date,due_date,status,subtotal,tax_rate,tax_amount,discount_amount,total_amount,balance_due,notes,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[client_id,request_id,quotation_id,invoice_number,issue_date,due_date,'ISSUED',subtotal,tax_rate,tax,discount_amount,total, total,notes,req.user.sub]); for(const item of normalized) await connection.execute('INSERT INTO invoice_items(invoice_id,description,quantity,unit_price,line_total) VALUES(?,?,?,?,?)',[r.insertId,item.description,item.quantity,item.unit_price,item.line_total]); await connection.execute('INSERT INTO activity_logs(user_id,action,entity_type,entity_id,details) VALUES(?,?,?,?,?)',[req.user.sub,'CREATE','INVOICE',r.insertId,JSON.stringify({invoice_number,total})]); await connection.commit(); res.status(201).json({id:r.insertId,invoice_number,total_amount:total}); }
    catch(e){await connection.rollback();res.status(400).json({error:e.message||'Unable to create invoice.'});} finally{connection.release();}
  });

  router.post('/payments', auth(['ADMIN','STAFF']), async (req,res) => {
    const {invoice_id,receipt_number,payment_date,amount,method='BANK_TRANSFER',reference=null,notes=null}=req.body;
    if(!invoice_id||!receipt_number||!payment_date||!Number(amount)||Number(amount)<=0) return res.status(400).json({error:'Invoice, receipt number, payment date and positive amount are required.'});
    const connection=await pool.getConnection();
    try { await connection.beginTransaction(); const [[invoice]]=await connection.query('SELECT id,total_amount,amount_paid FROM invoices WHERE id=? FOR UPDATE',[invoice_id]); if(!invoice) throw new Error('Invoice not found.'); const payment=money(amount); const newPaid=money(Number(invoice.amount_paid)+payment); if(newPaid>Number(invoice.total_amount)) throw new Error('Payment exceeds invoice balance.'); const status=newPaid===Number(invoice.total_amount)?'PAID':'PARTIALLY_PAID'; await connection.execute('INSERT INTO payments(invoice_id,receipt_number,payment_date,amount,method,reference,notes,received_by) VALUES(?,?,?,?,?,?,?,?)',[invoice_id,receipt_number,payment_date,payment,method,reference,notes,req.user.sub]); await connection.execute('UPDATE invoices SET amount_paid=?,balance_due=?,status=? WHERE id=?',[newPaid,money(Number(invoice.total_amount)-newPaid),status,invoice_id]); await connection.execute('INSERT INTO activity_logs(user_id,action,entity_type,entity_id,details) VALUES(?,?,?,?,?)',[req.user.sub,'CREATE','PAYMENT',invoice_id,JSON.stringify({receipt_number,payment})]); await connection.commit(); res.status(201).json({receipt_number,amount:payment,balance_due:money(Number(invoice.total_amount)-newPaid),status}); }
    catch(e){await connection.rollback();res.status(400).json({error:e.message||'Unable to record payment.'});} finally{connection.release();}
  });

  return router;
};
