'use strict'
import { Connection, Request } from 'tedious';

export function databaseConnect(){
    return new Promise((resolve,reject)=>{  
        const config = {
            server: 'HAI',
            authentication: {
                type: 'default',
                options: {
                    userName: 'hai',
                    password: 'likeme1314'
                }
            },
            options: {
                encrypt: true,
                trustServerCertificate: true,
                database: 'Library'
            }
        };
        const connection = new Connection(config);  
        connection.on('connect', function(err) {  
            if(err){
                console.error('数据库连接error事件：', err);
                reject(err);
            }
            else{
                console.log("Connected"); 
                resolve(connection);
            } 
        });
        connection.connect();
    });
}

export async function databaseSelect(sqlSelect) {
    const connection = await databaseConnect();
    return new Promise((resolve,reject)=>{
        let resultData = [];
        const request = new Request(sqlSelect, function (err) {
            if (err) {
                console.log("SQL查询错误：",err);
                connection.close();
                reject(err)
            }
            else{
                console.log('最终查询数据：', resultData)
                connection.close();
                resolve(resultData);
            }
        });
        request.on('row', function (columns) {
            let row = {};
            columns.forEach(item => {
                row[item.metadata.colName] = item.value;
            })
            resultData.push(row);
        });
        connection.execSql(request);
    })
}

export async function databaseInsert(sqlInsert) {  
    const connection = await databaseConnect();
    return new Promise((resolve, reject) => {
        const request = new Request(sqlInsert, function(err) {  
            connection.close();
            if (err) {  
                console.error('插入失败：', err);
                reject(err);
            } else {
                console.log('插入成功');
                resolve(true);
            }
        });  
        connection.execSql(request);  
    })
}

export async function databaseUpdate(sqlUpdata) {  
    const connection = await databaseConnect();
    return new Promise((resolve, reject) => {
        const request = new Request(sqlUpdata, function(err) {  
            connection.close();
            if (err) {  
                console.error('更新失败：', err);
                reject(err);
            } else {
                console.log('更新成功');
                resolve(true);
            }
        });  
        connection.execSql(request);  
    })
}