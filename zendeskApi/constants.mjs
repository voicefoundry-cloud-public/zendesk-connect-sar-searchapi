export const httpStatus = {
    ok: "ok", // 200
    badRequest: "bad request", // 400
    accessDenied: "access denied", // 403
    notFound: "not found", // 404
    serverError: "server error" // 500
};

export const defaults = {
    recentTicketHours: 72
};

export const returnType = {
    results: 'results',
    ticket: 'ticket',
    user: 'user'
};

export const keywordParams = [
    'search_template', 
    'return_fields', 
    'sort_by', 
    'sort_order'
];
