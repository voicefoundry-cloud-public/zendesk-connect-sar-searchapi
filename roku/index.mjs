console.log('Loading function');

const httpStatus = {
  ok: "ok", // 200
  badRequest: "bad request", // 400
  accessDenied: "access denied", // 403
  notFound: "not found", // 404
  serverError: "server error" // 500
};

export const handler = async (event, context) => {
    // console.log('Received event:', JSON.stringify(event, null, 2));

    const badRequestStatus = { status: httpStatus.badRequest };
    if (!(event.Name && event.Name === 'ContactFlowEvent')) {
        console.error('Unexpected event:', JSON.stringify(event, null, 2));
        return badRequestStatus;
    }

    const { Parameters } = event.Details;
    if (!searchBy) {
        console.error('Parameter(s) missing or empty:', Parameters);
        return badRequestStatus;
    }

    const response = await createTicket(Parameters);

    return response;
};

createTicket = async (Parameters) => {
  const capitalizeFirst = (phrase) => phrase.charAt(0).toUpperCase() + phrase.slice(1);

  // set the user as unidentified if missing
  if (!contactSession.user) {
    const name = contactSession.mediaType === connect.MediaType.CHAT ? "unspecified user" : contactSession.customerNo || "unknown user";
    contactSession.user = { name, id: null } as UnidentifiedUser;
  }
  const user = contactSession.user;

  let eventType: string;
  switch (contactSession.mediaType) {
    case connect.MediaType.CHAT:
      eventType = "incoming chat from";
      break;
    case connect.MediaType.TASK:
      eventType = "assigned task for";
      break;
    default:
      eventType = contactSession.outbound ? "outgoing call to" : "incoming call from";
  }

  const ticketSubject =
    contactSession.mediaType === connect.MediaType.TASK
      ? `${capitalizeFirst(eventType)} ${contactSession.taskName}`
      : contactSession.settings?.conversationTitle || `${capitalizeFirst(eventType)} ${user.name || "unknown user"}`;

  let ticket: ZendeskTicketInitial = {
    via_id: contactSession.outbound ? 46 : 45,
    subject: ticketSubject,
    requester_id: (user.id || session.zenAgentId)!,
    submitter_id: session.zenAgentId,
    assignee_id: session.zenAgentId,
  };

  // setting any other system or custom fields based on attributes
  await setTicketFieldsFromAttributes(contactSession, ticket, true);

  // generating internal note
  const { htmlBody, plainBody } = getTicketContactDetails(contactSession);
  ticket = {
    ...ticket,
    comment: {
      html_body: `<div>${htmlBody}</div>`,
      plain_body: plainBody,
      public: false,
    },
  };

  // checking brand
  const inboundQueueName = getQueueName(contactSession);
  const appSettings = contactSession.settings!;
  const brandName = brandMapping(inboundQueueName, appSettings, await getQueue2BrandMapping());

  if (brandName !== null) {
    const brands: ZendeskBrand[] = await zendeskApi.getFromZD(`brands`, "brands", []);
    const getBrand = brands.find((brand) => brand.active && brand.name === brandName);
    if (getBrand) {
      ticket.brand_id = getBrand.id;
    }
  }

  // checking custom ticket field based on ticket_outbound_queue
  const customField = await outboundQueueFieldValue(appSettings);
  if (customField) {
    ticket.custom_fields = [...(ticket.custom_fields || []), customField];
  }

  logger.log(logStamp("creating ticket: "), ticket);
  const data = await zendeskApi.saveToZD(
    `channels/voice/tickets.json`,
    "POST",
    JSON.stringify({
      // display_to_agent: session.zenAgentId,
      ticket,
    }),
    "createTicket",
    true,
  );
  const ticketId = data && data.ticket ? data.ticket.id : null;
  if (ticketId) {
    logger.log(logStamp("ticket created: "), data);
    await assignTicket(contactSession, ticketId);
  }
  return ticketId;
};
