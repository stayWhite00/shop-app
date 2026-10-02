import request from "@/utils/request";

/** 公告列表 */
export function getNoticeList(params) {
  return request({
    url: "/api/notice/list",
    method: "get",
    params,
  });
}

/** 公告详情 */
export function getNoticeDetail(noticeId) {
  return request({
    url: `/api/notice/${noticeId}`,
    method: "get",
  });
}
