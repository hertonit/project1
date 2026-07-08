import express from 'express';
import path from 'path';
import { databaseSelect, databaseInsert, databaseUpdate} from './database.js';
const app = express();
const PORT = 3000;

app.use(express.json());

// 获取当前运行目录
const __dirname = path.resolve();
// 修复：将静态资源目录设置为当前目录，而不是上一级目录
app.use(express.static(__dirname));

app.get('/',(req,res)=>{
    // 修复：直接去当前目录下寻找 index.html
    res.sendFile(path.join(__dirname, 'index.html'))
})

// 1. 获取图书列表 (读取 dbo.book 表)
app.get('/api/getBookList', async (req, res) => {
    try {
        const html = await databaseSelect('select * from book');
        res.json({code:200, data:html})
    } catch (e) {
        res.json({code:500, data:'<tr><td colspan="4">数据库加载失败</td></tr>'})
    }
})

// 2. 获取当前在借列表
app.get('/api/getBorrowList', async (req, res) => {
    try {
        const sql = `select * from userBorrow ub join book b on ub.book_id = b.book_id`;
        const html = await databaseSelect(sql);
        res.json({code:200, data:html})
    } catch (e) {
        res.json({code:500, data:'<tr><td colspan="2">暂无数据</td></tr>'})
    }
})

// 3. 获取历史借阅记录
app.get('/api/getBorrowHistory', async (req, res) => {
    try {
        const sql = `select * from book b join historyBorrowBook hbb on hbb.book_id = b.book_id`;
        const html = await databaseSelect(sql);
        res.json({code:200, data:html})
    } catch (e) {
        res.json({code:500, data:'<tr><td colspan="2">暂无数据</td></tr>'})
    }
})

app.get('/api/getBuyList', async (req, res) => {
    try {
        const sql = `select * from book b join userBuy ub on ub.book_id = b.book_id`;
        const html = await databaseSelect(sql);
        res.json({code:200, data:html})
    } catch (e) {
        res.json({code:500, data:'<tr><td colspan="2">暂无数据</td></tr>'})
    }
})


// 4. 提交借阅
app.post('/api/submitBorrow', async (req, res) => {
    const {bookId, userId} = req.body;
    const sql = `insert into userBorrow(user_id, book_id, borrow_number) values(${userId}, ${bookId}, 1)`;
    const sqlInsert = `insert into historyBorrowBook(user_id, book_id, borrow_number) values(${userId}, ${bookId}, 1)`;
    const sqlUpdate = `update book set book_number = book_number-1 where book_id = ${bookId}`;
    try {
        await databaseInsert(sql);
        await databaseUpdate(sqlUpdate);
        await databaseInsert(sqlInsert);
        res.json({code:200, msg:'借阅成功！'})
    } catch (e) {
        console.error(e);
        res.json({code:500, msg:'借阅失败'})
    }
})

//提交归还
app.post('/api/pushBook',async(req,res)=>{
    const {bookId, borrowId} = req.body;
    const sqlUpdate1 = `update book set book_number = book_number+1 where book_id = ${bookId}`;
    const sqlUpdate2 = `delete from userBorrow where borrow_id = ${borrowId}`;
    try{
        await databaseUpdate(sqlUpdate1);
        await databaseUpdate(sqlUpdate2);
        res.json({code:200, msg:'归还成功！'})
    }catch(e){
        console.error(e);
        res.json({code:500, msg:'归还失败'});
    }
})

//提交购买
app.post('/api/buyBook',async(req,res)=>{
    const {bookId} = req.body;
    const sqlUpdate1 = `update book set book_number = book_number-1 where book_id = ${bookId}`;
    const sqlInsert1 = `insert into userBuy(user_id, book_id, buy_number) values(1, ${bookId}, 1)`;
    try{
        await databaseUpdate(sqlUpdate1);
        await databaseInsert(sqlInsert1);
        res.json({code:200, msg:'购买成功！'})
    }catch(e){
        console.error(e);
        res.json({code:500, msg:'购买失败'});
    }
})


app.listen(PORT, ()=>{
    console.log('✅ 唯一访问地址：http://localhost:3000/index.html')
})