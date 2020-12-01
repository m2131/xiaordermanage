module.exports = app => {

    const {
        router,
        controller
    } = app;
    router.post('/api/orderList', controller.shopee.order.list);
    router.post('/api/uploadOrder', controller.shopee.order.upload);
    router.get('/api/shopList', controller.shopee.shop.list);
    router.post('/api/shopCreate', controller.shopee.shop.create);
    router.post('/api/shopUpdate', controller.shopee.shop.update);
    router.post('/api/shopRemoves', controller.shopee.shop.removes);

    //ApiRouters

}