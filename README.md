# WisCon Online Registration System

This repository contains code for the WisCon Online Registration system. 

This codebase contains two parts:

1. A [client](./client/README.md); and
2. A [server](./server/README.md)

At the high-level:

* this code is intended to work with Zambia (we share a database
with a Zambia instance so that we can delegate user management to Zambia). 
* the client is a React app, packaged using npm
* the server is a set of REST APIs implemented using PHP. I went with 
PHP because that's what Zambia was using
* the code uses Stripe as a payment gateway. We also support the idea of 
members sending cheques and/or paying cash in person at the door.