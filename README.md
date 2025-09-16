# zendesk-connect-sar-searchapi
Zendesk SAR Application for the Search API functionality used within Contact Flows

## Overview and Installation
Zendesk search for Amazon Connect is an optional add-on to the [Amazon Connect app for Zendesk](https://zendeskconnector.ttecdigital.solutions/zendesk/Working-version). It enables further driving the business logic of either DTMF driven (classic IVR) or conversation driven (LEX bot) contact flows, based on search results from the Zendesk Support API.

This add-on consists of a single lambda function which is called from a Connect contact flow and is passed-in parameters which contain the type of search and search values. It's possible to search users by their detected phone number (CLI), the entered user ID, custom user fields within Zendesk, the most recent open ticket for a given user, or anything else in Zendesk Support via search templates. 

You can view the detailed usage explanation and installation steps [here](https://zendeskconnector.ttecdigital.solutions/zendesk/Working-version/zendesk-search-for-connect-with-the-help-of-the-ze).

We have also provided a [sample contact flow](https://zendeskconnector.ttecdigital.solutions/zendesk/Working-version/template-contact-flows#id-(v3.1)TemplateContactFlows-Zendesk-searchZendeskSearch) to give you a better understanding of search capabilities this lambda function provides.
