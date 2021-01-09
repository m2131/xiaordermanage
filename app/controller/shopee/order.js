/*
 * @Author: doramart 
 * @Date: 2019-06-27 17:16:32 
 * @Last Modified by: doramart
 * @Last Modified time: 2020-07-27 17:03:50
 */
const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken')
const _ = require('lodash');
var CryptoJS = require("crypto-js");
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const pump = require('pump');
const {
    orderRule
} = require('@validate')
class OrderController extends Controller {
    async list() {
        const ctx = this.ctx;
        const {shopSite,shopID,pageSize,pageNo,orderStart,orderEnd,orderStatus,exclusionCanceled,mergeOrder} = ctx.request.body;
        /**重新导入数据**/
        let shopeeOrder = await ctx.service.shopeeOrder.find({current:""},{shopSite: "ph"});
        if(shopeeOrder.docs.length<=0){
            let that = this;
            let OrderPHResult = await that.ctx.model.OrderPH.find();
            let OrderTWResult = await that.ctx.model.OrderTW.find();
            let OrderMYResult = await that.ctx.model.OrderMY.find();
            let newList = [];
            function addPush(data,type){
                let newData = {
                    _id: data._id,
                    updateDate: data.updateDate,
                    buyShopID: data.buyShopID,
                    buyAccount : data.buyAccount,
                    buyPayAccount: data.buyPayAccount,
                    buyPrice: data.buyPrice,
                    buySendCompany: data.buySendCompany,
                    buySendOrderNo: data.buySendOrderNo,
                    buySendType: data.buySendType,
                    buySendState: data.buySendState,
                    buyTime: data.buyTime,
                    shopName: data.shopName,
                    shopID: data.shopID,
                    shopSite: data.shopSite,
                    OrderID: data.OrderID,
                    OrderStatus: data.OrderStatus,
                    OrderCreationDate: data.OrderCreationDate,
                    DeliveryMethod: data.DeliveryMethod,
                    NoOfProductInOrder: data.NoOfProductInOrder,
                    SKUReferenceNo: data.SKUReferenceNo,
                    ParentSKUReferenceNo: data.ParentSKUReferenceNo,
                    DealPrice: data.DealPrice,
                    EstimatedShipOutDate: data.EstimatedShipOutDate,
                    //拨款信息
                    _OriginalPrice: data._OriginalPrice,
                    _DealPrice: data._DealPrice,
                    _ShopeeRebate: data._ShopeeRebate,
                    _SellerBundleDiscount: data._SellerBundleDiscount,
                    _SellerCoinsVoucher: data._SellerCoinsVoucher,
                    _BuyerExpressFee: data._BuyerExpressFee,
                    _ShopeeExpressFee: data._ShopeeExpressFee,
                    _RealityExpressFee: data._RealityExpressFee,
                    _RefundAmount: data._RefundAmount,
                    _Commission: data._Commission,
                    _ServiceFee: data._ServiceFee,
                    _TransactionFee: data._TransactionFee,
                    _AppropriationMoney: data._AppropriationMoney,
                }
                const phObj = {
                    "To ship": "待出貨",
                    "Cancelled": "已取消",
                    "Unpaid": "尚未付款",
                    "Completed": "完成",
                    "Shipping": "運送中"
                };
                if(type == "ph" || type == "my"){
                    newData.OrderStatus =  phObj[data.OrderStatus];
                }
                return newData;
            }
            OrderPHResult.forEach(function(data) {
                newList.push(addPush(data,"ph"))
            });
            OrderMYResult.forEach(function(data) {
                newList.push(addPush(data,"my"))
            });
            OrderTWResult.forEach(function(data) {

                newList.push(addPush(data,"tw"))
            });
            ctx.service.shopeeOrder.create(newList);
        }
        /**重新导入数据**/
        let resultList = [];
        let queryData = {};
        if(orderStart && orderEnd){
            queryData.OrderCreationDate = {"$gte": new Date(orderStart), "$lt": new Date(orderEnd)};
        }
        if(exclusionCanceled){
            queryData.OrderStatus = {$ne:'已取消'}
        }
        shopID && (queryData.shopID = shopID);
        orderStatus && (queryData.OrderStatus = orderStatus);//exclusionCanceled,mergeOrder
        if(mergeOrder){
            resultList = await ctx.service.shopeeOrder.find({isPaging: '1',pageSize:100000,current:1},
                {query:queryData,shopSite: shopSite,sort:{OrderID: -1}});
            let listObj = {};
            resultList.docs.forEach(function(item){
                if(listObj[item.OrderID]){
                    let newBuyPrice = 0;
                    let SKUReferenceNo = listObj[item.OrderID].SKUReferenceNo;
                    if(listObj[item.OrderID].buyPrice){
                        newBuyPrice += Number(listObj[item.OrderID].buyPrice);
                        SKUReferenceNo = SKUReferenceNo + "{" +Number(listObj[item.OrderID].buyPrice).toFixed(1)+"}";
                    }
                    SKUReferenceNo = SKUReferenceNo + ";" + item.SKUReferenceNo;
                    if(item.buyPrice){
                        newBuyPrice += Number(item.buyPrice);
                        SKUReferenceNo = SKUReferenceNo + "{" + Number(item.buyPrice)+"}";
                    }
                    listObj[item.OrderID] = item;
                    newBuyPrice>0 && (listObj[item.OrderID].buyPrice = newBuyPrice);
                    listObj[item.OrderID].SKUReferenceNo = SKUReferenceNo;
                }else{
                    listObj[item.OrderID] = item;
                }
            })
            let newTotalItems = 0;
            let newResult = [];
            let totalSellAmount = 0;
            let totalBuyAmount = 0;
            for(var listKey in listObj){
                const listItem = listObj[listKey];
                ++newTotalItems;
                newResult.push(listItem);
                if(listItem.DealPrice){
                    listItem.shopSite == 'my' && (totalSellAmount+= Number(listItem.DealPrice)*1.6067);
                    listItem.shopSite == 'ph' && (totalSellAmount+= Number(listItem.DealPrice)*0.1347);
                    listItem.shopSite == 'tw' && (totalSellAmount+= Number(listItem.DealPrice)*0.2313);
                }
                if(listItem.buyPrice){
                    totalBuyAmount+= Number(listItem.buyPrice)
                }
            }
            const pageStart = pageSize*(pageNo-1);
            const pageEnd = pageSize*pageNo;
            resultList.docs = [];
            newResult.forEach((item,key)=>{
                if(pageStart <= key && key < pageEnd){
                    resultList.docs.push(item);
                }
            })
            resultList.pageInfo.totalItems = newTotalItems;
            resultList.pageInfo.pageSize = pageSize;
            resultList.pageInfo.totalPage = Math.ceil(newTotalItems/pageSize);
            resultList.pageInfo.totalSellAmount = totalSellAmount.toFixed(2);
            resultList.pageInfo.totalBuyAmount = totalBuyAmount.toFixed(2);
        }else{
            resultList = await ctx.service.shopeeOrder.find({isPaging: '1',pageSize:pageSize,current:pageNo},
                {query:queryData,shopSite: shopSite,sort:{OrderID: -1}});
        }
        ctx.helper.renderSuccess(ctx, {
            data: resultList,
        });
    }
    async upload() {
        const {ctx} = this;
        const file = ctx.request.files[0]; //获取上传文件
        if (!file) return ctx.throw(404);
        const source = fs.createReadStream(file.filepath); //创建可读流
        //const filename = encodeURIComponent(ctx.request.body.name) + path.extname(file.filename)
        const filename = new Date().getTime().toString().slice(7, 13) + "_" + file.filename;
        const distPath = path.join(this.config.baseDir, 'app/uploadFiles');
        const stat = fs.statSync(distPath);
        if (!stat.isDirectory()) {
            fs.mkdirSync(distPath);
        }
        const targetPath = path.join(this.config.baseDir, 'app/uploadFiles', filename);
        const target = fs.createWriteStream(targetPath);
        try {
            await pump(source, target);
            ctx.logger.warn('xls file will be save %s', targetPath);
        } finally {
            // delete those request tmp files
            await ctx.cleanupRequestFiles();
        }
        // 读取内容
        const workbook = xlsx.readFile(targetPath);
        const sheetNames = workbook.SheetNames; //获取表名
        const sheet = workbook.Sheets[sheetNames[0]]; //通过表名得到表对象
        //const thead = [sheet.A1.v, sheet.B1.v, sheet.C1.v, sheet.D1.v, sheet.E1.v, sheet.F1.v, sheet.G1.v, sheet.H1.v, sheet.I1.v];
        const data = xlsx.utils.sheet_to_json(sheet); //通过工具将表对象的数据读出来并转成json
        //const theadRule = ['SIM卡CCID', '手机号', '号码归属地', '品牌', '数据套餐', '办卡日期', '备注1', '所属公司', '设备ID'];
        //const isValid = thead.every((value, index) => value === theadRule[index]);
        const result = [];
        let saveResult;
        let {shopID, shopSite, shopName} = ctx.request.body;
        let xlsType = "order"; //order，income
        if (ctx.request.body.shopSite == "my") {
            for (let i = 0; i < data.length; i++) {
                if (!data[0]['Order ID'] && i >= 2) {
                    xlsType = "income";
                    result.push({
                        "OrderID": data[i]["Payee ID"],
                        "_OriginalPrice": data[i]["__EMPTY_2"],//"商品原价"
                        "_DealPrice": data[i]["__EMPTY_3"],//商品折扣
                        "_ShopeeRebate": data[i]["__EMPTY_4"],//Shopee回扣金额
                        "_SellerBundleDiscount": data[i]["__EMPTY_5"],//卖家优惠券金额
                        "_SellerCoinsVoucher": String(data[i]["__EMPTY_6"]),//卖家提供的Shopee币回扣
                        "_BuyerExpressFee": data[i]["__EMPTY_7"],//买家支付的运费
                        "_ShopeeExpressFee": data[i]["__EMPTY_8"],//Shopee运费补贴
                        "_RealityExpressFee": data[i]["__EMPTY_9"],//实际运费（Shopee代付）
                        "_RefundAmount": data[i]["__EMPTY_10"],//退款金額
                        "_Commission": data[i]["__EMPTY_11"],//佣金
                        "_ServiceFee": String(data[i]["__EMPTY_12"]),//服务费
                        "_TransactionFee": data[i]["__EMPTY_13"],//交易手续费
                        "_AppropriationMoney": data[i]["__EMPTY_14"],//拨款金额 ($)
                    })
                } else if (data[0]['Order ID']) {
                    let MD5String = data[i]['Order ID'] + data[i]['Parent SKU Reference No.'] + data[i]['SKU Reference No.'] + "";
                    result.push({
                        _id: CryptoJS.MD5(MD5String.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, "")).toString(),
                        shopID: shopID,
                        shopSite: shopSite,
                        shopName: shopName,
                        OrderID: data[i]['Order ID'],
                        OrderStatus: data[i]['Order Status'],
                        OrderCreationDate: new Date(data[i]['Order Creation Date']),
                        NoOfProductInOrder: data[i]['No of product in order'],
                        SKUReferenceNo: data[i]['SKU Reference No.'],
                        ParentSKUReferenceNo: data[i]['Parent SKU Reference No.'],
                        DealPrice: data[i]['Deal Price'],
                        EstimatedShipOutDate: new Date(data[i]['Estimated Ship Out Date']),
                    });
                }
            }
        }else if(ctx.request.body.shopSite == "ph"){
            for (let i = 0; i < data.length; i++) {
                if(!data[0]['Order ID'] && i>=2){
                    xlsType = "income";
                    result.push({
                        "OrderID": data[i]["Payee ID"],
                        "_OriginalPrice": data[i]["__EMPTY_2"],//"商品原价"
                        "_DealPrice": data[i]["__EMPTY_3"],//商品折扣
                        "_ShopeeRebate": data[i]["__EMPTY_4"],//Shopee回扣金额
                        "_SellerBundleDiscount": data[i]["__EMPTY_5"],//卖家优惠券金额
                        "_SellerCoinsVoucher": String(data[i]["__EMPTY_6"]),//卖家提供的Shopee币回扣
                        "_BuyerExpressFee": data[i]["__EMPTY_7"],//买家支付的运费
                        "_ShopeeExpressFee": data[i]["__EMPTY_8"],//Shopee运费补贴
                        "_RealityExpressFee": data[i]["__EMPTY_9"],//实际运费（Shopee代付）
                        "_RefundAmount": data[i]["__EMPTY_10"],//退款金額
                        "_Commission": data[i]["__EMPTY_11"],//佣金
                        "_ServiceFee": String(data[i]["__EMPTY_12"]),//服务费
                        "_TransactionFee": data[i]["__EMPTY_13"],//交易手续费
                        "_AppropriationMoney": data[i]["__EMPTY_14"],//拨款金额 ($)
                    })
                }else if(data[0]['Order ID']){
                    let MD5String = data[i]['Order ID']+data[i]['Parent SKU Reference No.']+data[i]['SKU Reference No.']+"";
                    result.push({
                        _id: CryptoJS.MD5(MD5String.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g,"")).toString(),
                        shopID: shopID,
                        shopSite: shopSite,
                        shopName: shopName,
                        OrderID: data[i]['Order ID'],
                        OrderStatus: data[i]['Order Status'],
                        OrderCreationDate: new Date(data[i]['Order Creation Date']),
                        EstimatedShipOutDate: new Date(data[i]['Estimated Ship Out Date']),
                        ParentSKUReferenceNo: data[i]['Parent SKU Reference No.'],
                        SKUReferenceNo: data[i]['SKU Reference No.'],
                        DealPrice: data[i]['Deal Price'],
                        NoOfProductInOrder: data[i]['Number of Items in Order'],

                    });
                }
            }
        }else if(shopSite == "tw"){
            for (let i = 0; i < data.length; i++) {
                if(!data[0]['訂單編號 (單)'] && i>=2){
                    xlsType = "income";
                    result.push({
                        "OrderID": data[i]["Payee ID"],
                        "_OriginalPrice": data[i]["__EMPTY_1"],//"商品原价"
                        "_DealPrice": data[i]["__EMPTY_2"],//商品折扣
                        "_ShopeeRebate": data[i]["__EMPTY_3"],//Shopee回扣金额
                        "_SellerBundleDiscount": data[i]["__EMPTY_4"],//卖家优惠券金额
                        "_SellerCoinsVoucher": String(data[i]["__EMPTY_5"]),//卖家提供的Shopee币回扣
                        "_BuyerExpressFee": data[i]["__EMPTY_6"],//买家支付的运费
                        "_ShopeeExpressFee": data[i]["__EMPTY_7"],//Shopee运费补贴
                        "_RealityExpressFee": data[i]["__EMPTY_8"],//实际运费（Shopee代付）
                        "_RefundAmount": data[i]["__EMPTY_9"],//退款金額
                        "_Commission": data[i]["__EMPTY_12"],//佣金
                        "_ServiceFee": String(data[i]["__EMPTY_13"]),//服务费
                        "_TransactionFee": data[i]["__EMPTY_14"],//交易手续费
                        "_AppropriationMoney": data[i]["__EMPTY_16"],//拨款金额 ($)
                    })
                }else if(data[0]['訂單編號 (單)']){
                    let MD5String = data[i]['訂單編號 (單)']+data[i]['主商品貨號']+data[i]['商品選項貨號'];
                    result.push({
                        _id: CryptoJS.MD5(MD5String.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g,"")).toString(),
                        shopID: shopID,
                        shopSite: shopSite,
                        shopName: shopName,
                        OrderID: data[i]['訂單編號 (單)'],
                        OrderStatus: data[i]['訂單狀態 (單)'],
                        OrderCreationDate: new Date(data[i]['訂單成立時間 (單)']),
                        DealPrice: data[i]['商品活動價格 (品)'],
                        DeliveryMethod: data[i]['寄送方式 (單)'],
                        NoOfProductInOrder: data[i]['數量'],
                        ParentSKUReferenceNo: data[i]['主商品貨號'],
                        SKUReferenceNo: data[i]['商品選項貨號'],
                    });
                }
            }
        }
        if(xlsType == "order"){
            console.log("in order")
            let updateResult;
            let resultOldList = [];//上传数据里面的老数据
            let oldList = [];//查询出来已存在的列表
            let resultNewList = [];//用来create的新列表
            let listObj = {};
            let oldListObj = {};
            let ids = [];
            let oldIds = [];
            result.forEach(item=>{
                ids.push(item._id);
                listObj[item._id] = item;
            })

            console.log("result"+ result.length)
            oldList = await ctx.service.shopeeOrder.find({isPaging: '0'},{query:{_id: ids}});
            console.log("oldList"+oldList.length)
            if(oldList.length>0){
                oldList.forEach(item=>{
                    oldIds.push(item._id);
                    oldListObj[item._id] = item;
                })
                result.forEach(item=>{
                    if(oldListObj[item._id]){
                        resultOldList.push(item)
                    }else{
                        resultNewList.push(item)
                    }
                })
                //updateResult = await ctx.service.shopeeOrder.updateMany(result,oldIds.join(","),resultOldList,shopSite);
                //await ctx.service.shopeeOrder.removes(ctx, oldIds.join(","),shopSite);
            }else {
                resultNewList = result;
            }
            console.log("resultNewList"+ resultNewList.length)
            if(resultNewList.length>0){
                saveResult = await ctx.service.shopeeOrder.create(resultNewList);
            }
            console.log("resultOldList"+resultOldList.length);
            if(resultOldList.length>0){
                resultOldList.forEach(async item=>{
                    let updateaa = await ctx.service.shopeeOrder.update(ctx, item._id, item);
                })
                //updateResult = await ctx.service.shopeeOrder.updateMany(result,oldIds.join(","),resultOldList,shopSite);
            }
        }else{
            result.forEach(async item=>{
                let OrderIDResult = await ctx.service.shopeeOrder.find({isPaging: '0'},{query:{OrderID: item.OrderID}});
                let OrderIDS = [];
                if(OrderIDResult.length>0){
                    OrderIDResult.forEach(item=>{
                        OrderIDS.push(item._id);
                    })
                    saveResult= await ctx.service.shopeeOrder.updateMany(ctx, OrderIDS.join(","), item);
                }
            })
        }

        console.log('saving ');
        console.log('saving ok');
        ctx.helper.renderSuccess(ctx);
    }
    async updatePurchase() {
        const {
            ctx,
            service
        } = this;
        try {
            let fields = ctx.request.body || {};
            const formObj = {
                buyShopID:fields.buyShopID,
                buyAccount : fields.buyAccount,
                buyPayAccount: fields.buyPayAccount,
                buyPrice: fields.buyPrice,
                buySendCompany: fields.buySendCompany,
                buySendOrderNo: fields.buySendOrderNo,
                buySendType: fields.buySendType,
                buySendState: fields.buySendState,
            }
            if(fields.buyTime == "new"){
                formObj.buyTime = new Date();
            }
            let oldItem = await ctx.service.shopeeOrder.item(ctx, {
                query: {
                    _id: fields._id
                },
                shopSite:fields.shopSite
            })

            if (_.isEmpty(oldItem)) {
                throw new Error("订单不存在");
            }
            await ctx.service.shopeeOrder.update(ctx, fields._id, formObj);

            ctx.helper.renderSuccess(ctx);
        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    }

}

module.exports = OrderController;