module.exports = app => {

    const {
        router,
        controller
    } = app;
    router.post('/api/orderList', controller.shopee.order.list);
    router.post('/api/uploadOrder', controller.shopee.order.upload);

    //ApiRouters

}