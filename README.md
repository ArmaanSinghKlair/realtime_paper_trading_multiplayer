# TraderJam.io - Realtime Paper Trading
A high-performance, scalable Paper Trading Multiplayer 👥 inspired by TradingView's front-end design and [Canva's realtime mouse-pointer architecture](https://www.canva.dev/blog/engineering/realtime-mouse-pointers/), featuring a custom-made HTML Canvas-based candlestick chart and real-time updates with other players’ actions and stats. This project demonstrates a cloud-native, microservices architecture with horizontally scalable components, built to explore cutting-edge technologies and deliver a robust, fault-tolerant trading simulation.
![trading_view_screenshot](https://github.com/user-attachments/assets/f0cf6854-855c-465b-8140-24559b274ec7)
### Project Motivation
I've always enjoyed exploring new technologies, so when I got into system design, I started reading every newsletter I could find. Canva’s post about their real-time mouse pointer system stood out, inspiring me to build a similar backend for a multiplayer paper trading platform. With trading being such a relevant topic, it felt like a great challenge. I spent late nights sorting out Redis and HAProxy configurations, understanding TradingView’s chart stats, and debugging multi-threading issues. Designing a scalable system from scratch was challenging, but seeing it work seamlessly made the effort rewarding.
### System Architecture
![image](https://github.com/user-attachments/assets/443982c2-0b18-47b9-ab64-52a6d8ceaca3)
---


## System Architecture
### Request Flow
 - **React App User Details Page:** Typing [traderjam.online](https://www.traderjam.online) in your browser initiates a web request that first goes to `API Gateway` which the routes to the `React Redux App`. 
 - **WebSocket Connection:** After user details are entered in the react app, it creates a WebSocket Connection via send a request to `API Gateway`, which load balances the request to an available `WebSocket Microservice` based on the `Least Connection Algorithm`. 
 - **Sending updates to other players:**  All updates to the trading room are sent via WebSocket messages. Once the message reaches the backend microservice, 2 things happen.
	 1. **In-Memory Pub-Sub**:  Service routes request in-memory to players currently connected to the trading room on the same microservice instance. This in-memory routing was built in a scalable enough manner via **multi-threaded pub-sub mechanism** I created in Java. **Brief Explanation**: 
### Backend-centric Architecture
 - [WebSocket Microservice](https://github.com/ArmaanSinghKlair/realtime-websocket-microservice)

**Scalability**: We can scale horizontally the number of server instances. When a new backend instance spins up, all new WebSocket connections are routed to that instance until the number of connections on it is roughly the same as on all other instances. ie `Least Connection Algorithm`.
**Delivery Guarantees**: Due to network partitions (eg. microservice instance loses connection to 

The backend comprises of a service-registry

This project is a `x`real-time collaboration, featuring a custom HTML Canvas-based candlestick chart and real-time mouse pointer synchronization. This project showcases a microservices-based backend, a responsive frontend, and modern DevOps practices, built to explore cutting-edge technologies and deliver a robust trading simulation

### Motivation & Project Overview

### Backend Architecture

⭐ **Star this repo if you find it useful!** ⭐
