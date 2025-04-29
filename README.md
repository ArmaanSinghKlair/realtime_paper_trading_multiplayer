# TraderJam.io - Realtime Paper Trading
A high-performance, scalable Paper Trading Multiplayer 👥 inspired by TradingView's front-end design and [Canva's realtime mouse-pointer architecture](https://www.canva.dev/blog/engineering/realtime-mouse-pointers/), featuring a custom-made HTML Canvas-based candlestick chart and real-time updates with other players’ actions and stats. This project demonstrates a cloud-native, microservices architecture with horizontally scalable components, built to explore cutting-edge technologies and deliver a robust, fault-tolerant trading simulation.
![trading_view_screenshot](https://github.com/user-attachments/assets/f0cf6854-855c-465b-8140-24559b274ec7)
## Project Motivation
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
### Tech Stack
-   **Backend**: Spring Microservices, WebSocket, Redis (Pub/Sub, Streams), Spring Cloud Netflix Eureka.
    
-   **Frontend**: React, React-Router, Redux Toolkit, React Bootstrap, HTML5 Canvas (Custom Candlestick Chart 😉), Nginx
     
-   **Infrastructure**: HAProxy, Docker
## Backend-centric Architecture
 - 🔗[WebSocket Microservice](https://github.com/ArmaanSinghKlair/realtime-websocket-microservice)
   - A stateless, horizontally scalable microservice built with Spring, WebSockets, and Redis, designed for real-time data streaming and synchronization of trading room interactions. 
   - This microservice features a **custom Pub/Sub Java-implementation** for same-microservice WebSocket communication and **Redis Pub/Sub and Streams** for intra-microservice communication, enabling fast, reliable messaging for actions like market orders, chat, and user updates.
  - 🔗[Load Balancing](https://github.com/ArmaanSinghKlair/realtime-app-docker-config/tree/main/realtime-app-docker-config/haproxy-config)
    - HAProxy ensures efficient routing of traffic to backend servers and handles SSL Termination.
  - 🔗[Service Registry](https://github.com/ArmaanSinghKlair/realtime-websocket-registry)
    - Registers Websocket Microservices and acts as a central repository using Spring Clould Netflix Eureka.

> ### Scalability  
> We can scale horizontally the number of WebSocket Microservice instances. When a new backend instance spins up, all new
> WebSocket connections are routed to that instance until the number of
> connections on it is roughly the same as on all other instances. ie
> `Least Connection Algorithm`.
> ### Delivery Guarantees
> Each WebSocket messages is classed as high and low priority. 
> 
>  - **High priority messages** use Redis Streams because it ensures that messages aren't lost if backend services loses the Redis
> connection. After the service reconnects, it can still read the
> messages it missed offline. Examples include user's market orders,
> connections/disconnections. 
>  - **Low priority messages** use Redis Pub/Sub for transporting low-priority messages quickly with a push-based system.
## Frontend Technologies
The frontend is a modern single-page-application (SPA) built using **React**, **React-router** and **Redux Toolkit**. It was inspired by TradingView's paper trading platform and is designed for real-time market data visualization and low-latency user interactions.
### Key Features
-   **🗠 Custom Candlestick Chart**:
	- Developed from scratch using **HTML5 Canvas** for high-performance rending for security price and user positions. Inspired by TradingView design.
	- Supports features like pan for navigation, tracks cursor movement to show current candlestick data, displays user positions and current security price with horizontal render lines.
        
-   **💨 Real-Time Collaboration**:
    -   Synchronizes trading room interactions using **WebSocket**, with **Redux Toolkit**’s middleware managing actions that send WebSocket messages and **async thunks** handling asynchronous logic.
    -   Employs **Redux Toolkit Slices** for efficient, modular state management.
        
-   **Deployment**:
    -   Served via **Nginx** for efficient static file delivery and caching in a high-availability setup.
    -   Proxied through **HAProxy** for seamless integration with backend services.
## Key Achievements

-   Developed a **distributed, horizontally scalable platform** with WebSocket technology and Redis platform for real-time price updates and collaborative features.
    
-   Developed a **custom candlestick chart** from scratch via HTML5 Canvas for high-performance visualization.
    
-   Implemented a **cloud-native microservices architecture** with Redis Pub/Sub and Streams for efficient, event-driven communication.
    
-   Used HAProxy and Nginx for infrastructure representing a starting-point for highly scalable and fault-tolerant webservices.
    
-   Researched loads of interesting technologies from scratch ie (Redis Pub/Sub & Streams, HAProxy, Docker, HTML Canvas, React Redux Toolkit) and put all the pieces together to form a starting point of an industry ready, highly scalable application.

⭐ **Star this repo if you find it useful!** ⭐
