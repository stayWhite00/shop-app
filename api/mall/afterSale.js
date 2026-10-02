import request from '@/utils/request'

/**
 * 申请售后
 * @param {Object} data 售后数据
 */
export function applyAfterSale(data) {
    return request({
        url: '/api/afterSale/apply',
        method: 'post',
        data
    })
}

/**
 * 获取售后列表
 * @param {Object} params 查询参数
 */
export function getAfterSaleList(params) {
    return request({
        url: '/api/afterSale/list',
        method: 'get',
        params
    })
}

/**
 * 获取售后详情
 * @param {number} afterSaleId 售后ID
 */
export function getAfterSaleDetail(afterSaleId) {
    return request({
        url: `/api/afterSale/${afterSaleId}`,
        method: 'get'
    })
}

/**
 * 填写退货物流
 * @param {number} afterSaleId 售后ID
 * @param {string} expressNo 快递单号
 */
export function submitReturnExpress(afterSaleId, expressNo) {
    return request({
        url: '/api/afterSale/returnExpress',
        method: 'post',
        data: { afterSaleId, expressNo }
    })
}

/**
 * 取消售后
 * @param {number} afterSaleId 售后ID
 */
export function cancelAfterSale(afterSaleId) {
    return request({
        url: `/api/afterSale/cancel/${afterSaleId}`,
        method: 'post'
    })
}
