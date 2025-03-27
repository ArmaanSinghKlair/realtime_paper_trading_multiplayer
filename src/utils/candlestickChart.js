export class UserMarketOrder{
	static ORDER_SIDE_TYPE = {
		BUY: 0,
		SELL: 1
	}
	static ORDER_STATUS_TYPE = {
		ALL: "ALL",
		// WORKING: "WORKING",
		// INACTIVE: "INACTIVE",
		FILLED: "FILLED",
		// CANCELLED:"CANCELLED",
		REJECTED:"REJECTED",
	}

	quantity;
	price;
	placeTime;
	orderId;
	status;
	orderSide;
	rejectionReason = 'Not enough funds to complete the order';	//default

	constructor(quantity, price, userId, orderSide){
		this.quantity = quantity;
		this.price = price;
		this.userId = userId;
		this.orderSide = orderSide;
		this.placeTime = new Date().valueOf();
		this.orderId = this.placeTime;
		this.status = UserMarketOrder.ORDER_STATUS_TYPE.FILLED;
	}
}
export class UserInfoSecPos {
	userId;
	username;
	firstName;
	lastName;
	color;
	constructor(userId, username, firstName, lastName, color){
		if(!userId || !username || !firstName || !lastName || !color){
			alert('Invalid User details recieved');
			throw new Error('Invalid User details recieved');
		}
		this.userId = userId;
		this.username = username;
		this.firstName = firstName;
		this.lastName = lastName;
		this.color = color;
	}

	//Returns user's initials.
	static getUserInitials(userInfoSecPos){
		return userInfoSecPos.firstName.charAt(0).toUpperCase()+""+userInfoSecPos.lastName.charAt(0).toUpperCase();
	}
}

export class UserSecurityPosition {
	// Variables to track account and position state
	ownedQuantity; // Quantity owned (negative for short positions)
	avgBuyPrice; // Average price for long positions
	avgSellPrice; // Average price for short positions
	accountBalance; // Initial account balance
	unrealizedPL; // Unrealized profit/loss
	realizedPL; // Realized profit/loss
	userInfo;	//{userId: 1, username: 'ArmaanKlair', firstName: 'Armaan', lastName: 'Klair', color: 'rgba(110,137,90,1)'}	- all fields are guarenteed values.
	
	static INITIAL_ACCT_BALANCE = 10000;	//$10,000

	// candlestickChart;
	constructor(userInfo){		
		this.userInfo = userInfo;
		//link this user position with the chart
		// this.candlestickChart = candlestickChart;
		// this.candlestickChart.userSecPosMap.set(userInfo.userId, this);

		this.ownedQuantity = 0; // Quantity owned (negative for short positions)
		this.avgBuyPrice = null; // Average price for long positions
		this.avgSellPrice = null; // Average price for short positions
		this.accountBalance = UserSecurityPosition.INITIAL_ACCT_BALANCE; // Initial account balance
		this.unrealizedPL = 0; // Unrealized profit/loss
		this.realizedPL = 0;
	}
}

export class UserSecPosUtils {	
	/**
	 * Buy security. Updates input userPos object with correct values
	 * @param {number} quantity - Quantity to buy
	 * @param {number} price - Current market price
	 */
	static buySecurity(marketOrder, userSecPos) {
		const {quantity, price} = marketOrder;
		if(!userSecPos){
			return;
		}

		if (userSecPos.ownedQuantity < 0) {
			// If currently short, close the short position first
			const shortCloseQuantity = Math.min(Math.abs(userSecPos.ownedQuantity), quantity);

			// Realize profit/loss for the closing short position
			let shortCloseProfit = (userSecPos.avgSellPrice - price) * shortCloseQuantity;
			userSecPos.realizedPL += shortCloseProfit;
			userSecPos.accountBalance += shortCloseQuantity * userSecPos.avgSellPrice + shortCloseProfit;
			
			const longQuantity = quantity + userSecPos.ownedQuantity;
			if (longQuantity > 0) {
				// Open a new long position with the remaining quantity
				userSecPos.avgBuyPrice = price;
				userSecPos.ownedQuantity += longQuantity;
				userSecPos.accountBalance -= longQuantity * price;
			}
			userSecPos.ownedQuantity += shortCloseQuantity;
			// Reset this.avgSellPrice if position is fully closed
			if (userSecPos.ownedQuantity === 0) userSecPos.avgSellPrice = null;
		} else {
			const tradeValue = quantity * price;

			// Update average buy price for long position
			if(userSecPos.ownedQuantity == 0){
				userSecPos.avgBuyPrice = price;
			} else{
				userSecPos.avgBuyPrice = (userSecPos.avgBuyPrice * userSecPos.ownedQuantity + tradeValue) / (userSecPos.ownedQuantity + quantity);
			}

			// Update owned quantity
			userSecPos.ownedQuantity += quantity;
			// Deduct trade value from account balance
			userSecPos.accountBalance -= quantity * price;
		}

		UserSecPosUtils.updateUnrealizedPL(price, userSecPos);
		console.log(`Bought ${quantity} units at $${price}. Unrealized PL is ${userSecPos.unrealizedPL}`);
	}

	/**
	 * Sell security (or short if selling more than owned)
	 * @param {number} quantity - Quantity to sell
	 * @param {number} price - Current market price
	 */
	static sellSecurity(marketOrder, userSecPos) {
		const {quantity, price} = marketOrder;
		if(!userSecPos){
			return;
		}

		if(userSecPos.ownedQuantity > 0){
			//SELL long position
			let sellQuantity = Math.min(quantity, userSecPos.ownedQuantity);
			const realizedProfit = (price - userSecPos.avgBuyPrice) * sellQuantity;	
			userSecPos.realizedPL += realizedProfit;
			userSecPos.accountBalance += sellQuantity * price;	//pocket money after selling exisiting shares
			
			if(quantity > userSecPos.ownedQuantity){
				//SHORT remaining
				const shortQuantity = quantity - userSecPos.ownedQuantity;
				userSecPos.avgSellPrice = price;
				userSecPos.ownedQuantity -= shortQuantity;	//remove SHORT quanity from current owned units
				userSecPos.accountBalance -= shortQuantity * price;
			}
			userSecPos.ownedQuantity -= sellQuantity;	//remove SELL quanity from current owned units
			// Reset this.avgBuyPrice if position is fully closed
			if (userSecPos.ownedQuantity === 0) userSecPos.avgBuyPrice = null;
		} else{
			//SHORT ONLY
			if(userSecPos.ownedQuantity === 0 ){
				userSecPos.avgSellPrice = price;
			} else{
				userSecPos.avgSellPrice = (userSecPos.avgSellPrice * Math.abs(userSecPos.ownedQuantity) + quantity * price) / (Math.abs(userSecPos.ownedQuantity) + quantity);
			}
			userSecPos.ownedQuantity -= quantity;
			userSecPos.accountBalance -= quantity * price;
		}

		UserSecPosUtils.updateUnrealizedPL(price, userSecPos);
		console.log(`Sold ${quantity} units at $${price}. Unrealized PL is ${userSecPos.unrealizedPL}`);
	}

	/**
	 * Update unrealized P&L based on the current market price
	 * @param {number} latestClosePrice - Current market price
	 */
	static updateUnrealizedPL(latestClosePrice, userSecPos) {
		if(!userSecPos){
			return;
		}
		if (userSecPos.ownedQuantity > 0) {
			userSecPos.unrealizedPL = (latestClosePrice - userSecPos.avgBuyPrice) * userSecPos.ownedQuantity;
		} else if (userSecPos.ownedQuantity < 0) {
			userSecPos.unrealizedPL = (userSecPos.avgSellPrice - latestClosePrice) * Math.abs(userSecPos.ownedQuantity);
		} else {
			userSecPos.unrealizedPL = 0; // No position
		}
	}

	static getUserSecMarketValue(userSecPos, price){
		return Math.abs(userSecPos.ownedQuantity) * price;
	}

	static getUserSecEquity(userSecPos) {
		return userSecPos.accountBalance+ userSecPos.unrealizedPL;
	}

	static getAvgFillPrice(userSecPos) {
		return userSecPos.ownedQuantity > 0 ? userSecPos.avgBuyPrice : userSecPos.avgSellPrice
	}
	/**
	 * Display account and position details
	 * @param {number} price - Current market price
	 */
	static getUserPositionSummaryHtml(userSecPos) {
		// Calculate key metrics
		// const marketValue = userSecPos.getMarketValue(price); // Value of current position
		// const equity = userSecPos.getEquity(); // Total account value
		// const availableFunds = userSecPos.accountBalance; // Simplified: No margin/leverage
		// const avgFillPrice = userSecPos.getAvgFillPrice(); // Avg price based on position
	
		return `
			<table>
				<tr><td><b>Name</b><td> <td>${userSecPos.userInfo.firstName} ${userSecPos.userInfo.lastName} (${userSecPos.userInfo.username})</td></tr>
				<tr><td><b>Account Balance</b><td> <td>${userSecPos.accountBalance.toFixed(2)} USD</td></tr>
				<tr><td><b>Unrealized P&L</b><td> <td>${userSecPos.unrealizedPL.toFixed(2)} USD</td></tr>
				<tr><td><b>Owned Quantity</b><td> <td>${userSecPos.ownedQuantity}</td></tr>
			</table>
		`;
		// console.log("\n--- Account Details ---");
		// console.log(`Current Market Price: $${price}`);
		// console.log(`Owned Quantity: ${userSecPos.ownedQuantity}`);
		// console.log(`Avg Fill Price: $${avgFillPrice || 0}`);
		// console.log(`Market Value: $${marketValue.toFixed(2)}`);
		// console.log(`Account Balance: $${userSecPos.accountBalance.toFixed(2)}`);
		// console.log(`Unrealized P&L: $${userSecPos.unrealizedPL.toFixed(2)}`);
		// console.log(`Realized P&L: $${userSecPos.realizedPL.toFixed(2)}`);
		// console.log(`Equity: $${equity.toFixed(2)}`);
		// console.log(`Available Funds: $${availableFunds.toFixed(2)}`);
		// console.log("------------------------");
	}
}

export class CandlestickChart{

	ratio = window.devicePixelRatio || 1;

	//DEFAULTS
	textColor = "#2A2E39";	//var(--bs-body-color)
	gridLinesColor = '#EBEBEB';	//white theme = #EBEBEB, black = #1C1C1C
	mouseHoverLinesColor = '#a2a2a2';	//BOTH themes= #9C9C9C
	greenColor = 'green';	//var(--bs-succcess-rgb)
	redColor = 'red';	//var(--bs-danger-rgb)
	blueColor = 'blue'
	userSecPopoverBgColor = "#F2F2F3";	//var(--bs-popover-bg)
	userSecPopoverBorderColor = "rgba(0, 0, 0, 0.175)";	//var(--bs-popover-border-color)
	userSecPopoverBorderRadius = 16;	//var(--bs-border-radius-xl)
	defaultTextFontSize = 14;	//14
	smTextFontSize = 12;	//app-fs-sm
	chartFontFamily = 'Arial, sans-serif';

	//Time period decides everything width of candlesticks because of time period (ie how many candlesticks can fit inside timeperiod)
	X_AXIS_TIME_PERIOD = 10;	//10 mins diff each x-axis value
	MIN_X_AXIS_TIME_PERIOD = 5;	//CANNOT go below 5 mins

	//dimension stuff
	X_AXIS_HEIGHT = 30;
	Y_AXIS_WIDTH = 60;
	MAX_Y_AXIS_LABEL_NUM = 10;
	MIN_Y_AXIS_LABEL_NUM = 6;
	Y_AXIS_PRICE_BOX_HEIGHT = 25;
	DEFAULT_BOX_BORDER_RADIUS = 5;
	CANDLESTICK_SPACING = 3; // Space between candlesticks;
	CANDLESTICK_STATS_BOX_HEIGHT = 30;	//30px
	CHART_PL_PADDING = 50;
	INTER_PL_BOX_PADDING = 25;
	CHART_PL_BOX_HEIGHT = this.defaultTextFontSize + 5;

	//Tells if user has dragged the chart at least once. If not the chart automatically moves to the right.
	isDragStart;

	//Instance vars
	prevLastXAxisTimestamp;
	lastXAxisTimestamp;	//lots of elements rely on lastXAxisTimestamp to render as a starting point from rightside of the graph
	xAxisPeriodWidth;
	lastCandlestickIndex;

	//dimensions stuff
	candlestickChartWidth;
	candlestickHeight;
	candlestickWidth;
	userPLInChartPosArr;	//positions of all unrealized PL boxes for each user whose avgBuyPrice falls withing the chart min/max price
	userPLOutChartPosArr;	//positions of all unrealized PL boxes for each user whose avgBuyPrice falls withing the chart min/max price

	//canvas stuff
	candleCtx;
	xAxisCtx;
	yAxisCtx;
	candlestickCanvas;        
	xAxisCanvas;
	yAxisCanvas;

	//mouse movment stuff
	curOhlcDataArr;	//populated from outside in reloadCandlestickChart method
	isDragging;
	dragStartXPos;
	prevDragOffset;	//keeps track of prev drag offset
	mouseX;
	mouseY;
	curMinPrice; //current minPrice based on visible candlesticks
	curMaxPrice; //current max price based on visible candlesticks

	//actual HTML element where the chart will be drawn
	chartContainerId;
	chartContainerWidth;
	chartContainerHeight;
	chartCanvasEl;
	xAxisCanvasEl;
	yAxisCanvasEl;
	statsDivEl;
	popoverDivEl;

	//user Security positions
	userSecPosMap;

	//event listeners outside chart
	documentMouseUpListener;	//could be null

	constructor({chartContainerId, chartContainerWidth, chartContainerHeight}){
		if(!chartContainerId || !chartContainerWidth || !chartContainerHeight){
			throw new Error("chartContainerId, chartWidth and chartHeight are required.");
		}
		this.chartContainerId = chartContainerId;
		this.chartContainerWidth = chartContainerWidth;
		this.chartContainerHeight = chartContainerHeight;
		this.userSecPosInfo = new Map();
		this.userPLInChartPosArr = [];
		this.userPLOutChartPosArr = [];
		this.isDragStart = false;
		
		//Generate HTML for canvas
		{
			//required dimensions
			this.candlestickChartWidth = this.chartContainerWidth-this.Y_AXIS_WIDTH;
			this.candlestickHeight = this.chartContainerHeight-this.X_AXIS_HEIGHT;

			const chartContainer = document.getElementById(this.chartContainerId);
			if(!chartContainer){
				throw new Error("Chart Container with ID: #"+this.chartContainerId+" not found.");
			}
			Object.assign(chartContainer.style, {
				position:"relative",
				width: this.chartContainerWidth+'px',
				height: this.chartContainerHeight+'px',
				padding: 0,
				margin: 0
			});

			//now create required canvas elements
			this.chartCanvasEl = document.createElement("canvas");
			this.xAxisCanvasEl = document.createElement("canvas");
			this.yAxisCanvasEl = document.createElement("canvas");
			this.statsDivEl = document.createElement("div");
			this.popoverDivEl = document.createElement("div");

			// Apply styles
			Object.assign(this.chartCanvasEl.style, {
				position: "absolute",
				cursor: "crosshair"
			});
		
			Object.assign(this.xAxisCanvasEl.style, {
				position: "absolute",
				left: "0",
				top: this.candlestickHeight+"px"
			});
		
			Object.assign(this.yAxisCanvasEl.style, {
				position: "absolute",
				right: "0"
			});
		
			Object.assign(this.statsDivEl.style, {
				position: "absolute",
				top: "0",
				left: "0",
				height: this.CANDLESTICK_STATS_BOX_HEIGHT+"px",
				padding: "10px",
				fontFamily: this.chartFontFamily
			});

			Object.assign(this.popoverDivEl.style, {
				position: 'absolute', 
				display: 'none', 
				background: this.userSecPopoverBgColor, 
				boxShadow: "solid 1px " + this.userSecPopoverBorderColor, 
				padding: '5px', 
				fontSize: this.defaultTextFontSize+"px",
				pointerEvents: 'none',
				fontFamily: this.chartFontFamily,
				borderRadius: this.userSecPopoverBorderRadius+"px",
				color: this.textColor
			})

			//Add default text
			this.statsDivEl.textContent = "Hover over chart for details.";
			
			//append to chart
			chartContainer.appendChild(this.chartCanvasEl);
			chartContainer.appendChild(this.xAxisCanvasEl);
			chartContainer.appendChild(this.yAxisCanvasEl);
			chartContainer.appendChild(this.statsDivEl);
			chartContainer.appendChild(this.popoverDivEl);

			//setup canvases for anti-aliasing handling and set width&height as well
			this.candlestickCanvas = this.#createHiDPICanvas(this.chartCanvasEl, this.candlestickChartWidth, this.candlestickHeight);        
			this.xAxisCanvas = this.#createHiDPICanvas(this.xAxisCanvasEl, this.chartContainerWidth, this.X_AXIS_HEIGHT);
			this.yAxisCanvas = this.#createHiDPICanvas(this.yAxisCanvasEl, this.Y_AXIS_WIDTH, this.chartContainerHeight-this.X_AXIS_HEIGHT);
		}

		this.xAxisPeriodWidth = 200;
		this.lastCandlestickIndex=0;	
		

		// Event Listeners for dragging on canvas
		this.candlestickCanvas.addEventListener('mousedown', (event) => {
			this.#startDrag();
			event.preventDefault();	//prevent anything else than code above
		});
		this.documentMouseUpListener = document.addEventListener('mouseup', (event) => {
			//end drag on mouse up on chart
			this.#endDrag();
			event.preventDefault();	//prevent anything else than code above
		});

		this.candlestickCanvas.addEventListener('mouseleave', (event) => {
			this.mouseX = null;
			this.mouseY = null;
			this.popoverDivEl.style.display = "none";
			event.preventDefault();	//prevent anything else than code above
		});

		this.candlestickCanvas.addEventListener('mousemove', (event) => {
			//End dragging if user went off canvas
			this.mouseX = event.offsetX;
			this.mouseY = event.offsetY;
			
			//dragging logic		
			if (this.isDragging == true && this.curOhlcDataArr) {
				if(this.dragStartXPos == null){
					this.dragStartXPos = this.mouseX;
				}
				let mouseDragOffset = this.mouseX - this.dragStartXPos;
				if(this.#shiftDataRange(mouseDragOffset)){
					let dragTimeDelta = this.#getTimeFromDistance(mouseDragOffset); //60*1000 for converting to milliseconds
					this.lastXAxisTimestamp = -1*dragTimeDelta + this.prevLastXAxisTimestamp;
					
					//figureout last candlestick to show based on updated lastXAxisTimestamp
					if(mouseDragOffset > this.prevDragOffset){
						//user went left - towards older data
						while(this.lastCandlestickIndex >= 0 && this.curOhlcDataArr[this.lastCandlestickIndex].timestamp > this.lastXAxisTimestamp){		//keep a buffer of 1 candlestick offscreen
							this.lastCandlestickIndex--;
						}
					} else {
						//user went right - towards newer data
						while(this.lastCandlestickIndex < this.curOhlcDataArr.length-1 && this.curOhlcDataArr[this.lastCandlestickIndex].timestamp < this.lastXAxisTimestamp - 2*this.#getTimeFromDistance(this.candlestickWidth+this.CANDLESTICK_SPACING)){	//keep a buffer of 1 candlestick offscreen
							this.lastCandlestickIndex++;
						}
					}
					this.prevDragOffset = mouseDragOffset;	//update this.prevDragXPos to current dragoffset					
				}
				
			}
			this.reloadCandlestickChart(this.curOhlcDataArr);	//handle mouse pointers etc.
			

			//now check for popovers
			let isMousePointerOverlap = false;
			this.userPLInChartPosArr.forEach(userPLInfo => {
				isMousePointerOverlap = isMousePointerOverlap || this.#moveTooltipOverlapPLBox(userPLInfo);
			});
			this.userPLOutChartPosArr.forEach(userPLInfo => {
				isMousePointerOverlap = isMousePointerOverlap || this.#moveTooltipOverlapPLBox(userPLInfo);
			});
			//hide popover if nothing overlapping
			if(!isMousePointerOverlap){
				this.popoverDivEl.style.display = "none";
			}
			
			event.preventDefault();	//prevent anything else than code above
		});

		this.candleCtx = this.candlestickCanvas.getContext('2d');
		this.xAxisCtx = this.xAxisCanvas.getContext('2d');
		this.yAxisCtx = this.yAxisCanvas.getContext('2d');		
		
		this.curOhlcDataArr = null;
		this.isDragging = false;
		this.dragStartXPos = null;
		this.prevDragOffset = null;	//keeps track of prev drag offset
		this.mouseX = 0;
		this.mouseY = 0;
		
		this.candlestickWidth = Math.floor((this.xAxisPeriodWidth - (this.X_AXIS_TIME_PERIOD*this.CANDLESTICK_SPACING)) / this.X_AXIS_TIME_PERIOD);
		if(this.candlestickWidth%2 == 0){
			this.candlestickWidth--;
		}
	}

	/**
	 * =================================================================================================================
	 * PUBLIC METHODS below
	 * =================================================================================================================
	 */

	/**
	 * Changes typography and colors of chart
	 * @param {*} themeObj 
	 */
	setCandlestickTheme(themeObj){
		this.textColor = themeObj.textColor;
		this.gridLinesColor = themeObj.gridLinesColor;
		this.mouseHoverLinesColor = themeObj.mouseHoverLinesColor;
		this.greenColor = themeObj.greenColor;
		this.redColor = themeObj.redColor;
		this.blueColor = themeObj.blueColor;

		this.userSecPopoverBgColor = themeObj.userSecPopoverBgColor;
		this.userSecPopoverBorderColor = themeObj.userSecPopoverBorderColor;
		this.userSecPopoverBorderRadius = themeObj.userSecPopoverBorderRadius;		
		this.defaultTextFontSize = themeObj.defaultTextFontSize;
		this.smTextFontSize = themeObj.smTextFontSize;
		this.chartFontFamily = themeObj.chartFontFamily;
		//Finally reload chart
		if(this.curOhlcDataArr){
			this.reloadCandlestickChart(this.curOhlcDataArr);
		}
	}

	/**
	 * Used to reload chart when new data comes in 
	 */
	updateLatestCandle(candleData){
		//initialize if null
		if(!this.curOhlcDataArr){
			this.curOhlcDataArr = [];	
		}

		//update latest candle OR push a new candle
		if(this.curOhlcDataArr.length >0 && candleData.timestamp == this.curOhlcDataArr[this.curOhlcDataArr.length-1].timestamp){
			this.curOhlcDataArr[this.curOhlcDataArr.length-1] = candleData;
		} else{
			this.curOhlcDataArr.push(candleData);
		}
		
		//Finally reload chart
		this.reloadCandlestickChart(this.curOhlcDataArr);
	}

	/**
	 * Called to update user positions.
	 * Reloads the chart as well.
	 */
	updateUserSecPos(userSecPosMap){
		this.userSecPosInfo = userSecPosMap;
		//Reload chart
		this.reloadCandlestickChart(this.curOhlcDataArr);
	}

	/**
	 * Refreshes the chart with given data array.
	 * @param {*} candlestickDataArr 
	 */
	reloadCandlestickChart(candlestickDataArr) {
		this.curOhlcDataArr = candlestickDataArr;
		if(!this.curOhlcDataArr){
			return;
		}
		if(!this.isDragStart){
			this.lastCandlestickIndex = this.curOhlcDataArr.length-1;
			//padding on right of chart when user hasn't started dragging
			let lastXAxisDate = new Date(this.curOhlcDataArr[this.lastCandlestickIndex].timestamp);
			lastXAxisDate.setUTCMinutes(lastXAxisDate.getUTCMinutes() + (0.75*this.X_AXIS_TIME_PERIOD), 0, 0);
			this.lastXAxisTimestamp = lastXAxisDate.valueOf();
			this.prevLastXAxisTimestamp = this.lastXAxisTimestamp;
		}

		this.candleCtx.clearRect(0, 0, this.candlestickCanvas.width, this.candlestickCanvas.height);
		this.xAxisCtx.clearRect(0, 0, this.xAxisCanvas.width, this.xAxisCanvas.height);
		this.yAxisCtx.clearRect(0, 0, this.yAxisCanvas.width, this.yAxisCanvas.height);
		
		//draw a line below x-axis...just to separate it from below
		this.xAxisCtx.beginPath();
		this.xAxisCtx.lineWidth=0.5;
		this.xAxisCtx.strokeStyle = this.gridLinesColor;
		this.xAxisCtx.moveTo(0, this.X_AXIS_HEIGHT);
		this.xAxisCtx.lineTo(this.chartContainerWidth, this.X_AXIS_HEIGHT);
		this.xAxisCtx.stroke();
		this.xAxisCtx.closePath();

		// Determine the min and max price to scale the chart
		let lastCandleRightOffset = this.#getOffsetRightByCandlestick(this.lastCandlestickIndex);
		let firstCandlestickIndex = Math.max(0, this.lastCandlestickIndex - Math.floor((this.candlestickChartWidth-lastCandleRightOffset)/(this.CANDLESTICK_SPACING + this.candlestickWidth)));
		let minPrice = Number.MAX_SAFE_INTEGER;
		let maxPrice = 0;
		for (let i = this.lastCandlestickIndex; i >= firstCandlestickIndex; i--) {
			minPrice = Math.min(minPrice, this.curOhlcDataArr[i].low);
			maxPrice = Math.max(maxPrice, this.curOhlcDataArr[i].high);
		}
		
		//generate new prices and y-axis points
		let updatePricePointObj = this.#getYAxisPoints(maxPrice, minPrice);
		this.curMaxPrice = updatePricePointObj.newMax;
		this.curMinPrice = updatePricePointObj.newMin;
		let pricePoints = updatePricePointObj.yAxisPoints;
		const priceRange = this.curMaxPrice - this.curMinPrice;
		//console.log("max= ",this.curMaxPrice, "min = ", this.curMinPrice, "pricePoints= ", pricePoints);
		
		// Draw axes
		this.#drawBgGridLines(pricePoints);
		
		for (let i = this.lastCandlestickIndex; i >= firstCandlestickIndex; i--) {
			let curCandleRightOffset = this.#getOffsetRightByCandlestick(i);
			const x = Math.floor(this.candlestickChartWidth - curCandleRightOffset);
			const { open, high, low, close } = this.curOhlcDataArr[i];
			

			// Scale the prices to fit within the chart
			let scaledHigh = Math.round(this.candlestickHeight - ((high - this.curMinPrice) / priceRange) * this.candlestickHeight);
			let scaledLow = Math.round(this.candlestickHeight - ((low - this.curMinPrice) / priceRange) * this.candlestickHeight);
			let scaledOpen = Math.round(this.candlestickHeight - ((open - this.curMinPrice) / priceRange) * this.candlestickHeight);
			let scaledClose = Math.round(this.candlestickHeight - ((close - this.curMinPrice) / priceRange) * this.candlestickHeight);

			const candlestickColor = this.#getCandlestickColor(open, close);
			this.candleCtx.lineWidth=1;
			this.candleCtx.strokeStyle=candlestickColor;
			this.candleCtx.beginPath();
			this.candleCtx.moveTo(x +0.5, scaledHigh);
			this.candleCtx.lineTo(x+0.5, scaledLow);
			this.candleCtx.stroke();
			//console.log(Math.min(scaledOpen, scaledClose), "x = ",x);
			this.candleCtx.fillStyle = candlestickColor;
			this.candleCtx.fillRect(
				x - this.candlestickWidth / 2+0.5,
				Math.min(scaledOpen, scaledClose)+0.5,
				this.candlestickWidth,
				Math.abs(scaledOpen - scaledClose)
			);
		}

		this.#drawUserSecurityHoldingInfo();
		// Draw mouse pointer dashed lines
		this.#drawPointerLines();
	}

	/**
	 * Removes the chart from document and reverts all changes.
	 */
	removeChart(){
		document.removeEventListener("mouseup", this.documentMouseUpListener);
		this.documentMouseUpListener = null;
		document.getElementById(this.chartContainerId).innerHTML="";
	}

	/**
	 * =================================================================================================================
	 * PRIVATE METHODS below
	 * =================================================================================================================
	 */

	/**
	 * Helper function that creates&returns a NON-blurry canvas
	 * @param {*} canvas canvas to optimize
	 * @param {*} width 
	 * @param {*} height 
	 * @returns 
	 */
	#createHiDPICanvas(canvas, width, height) {
		canvas.width = width * this.ratio;
		canvas.height = height * this.ratio;
		canvas.style.width = width + "px";
		canvas.style.height = height + "px";
		canvas.getContext("2d").scale(this.ratio, this.ratio);
		return canvas;
	}

	/**
	 * Stops the candlestick chart dragging fucntionality. 
	 * Should ONLY be called internally
	 */
	#endDrag(){
		this.isDragging = false;
		this.dragStartXPos = null;	//reset drag offset
		this.prevDragOffset = null;
		this.prevLastXAxisTimestamp = this.lastXAxisTimestamp;
		this.chartCanvasEl.style.cursor = "crosshair";
	}

	/**
	 * Initiates the candlestick chart dragging functionality
	 * Should ONLY be called internally
	 */
	#startDrag(){
		this.isDragging = true;
		this.dragStartXPos = null;	//reset drag offset
		this.prevDragOffset = null;
		this.chartCanvasEl.style.cursor = "grabbing";
		this.isDragStart = true;	//user has dragged at least once.
	}

	/**
	 * Returns the time equivalent of distance on the chart
	 * Should ONLY be called internally
	 */
	#getTimeFromDistance(distance){
		return (this.X_AXIS_TIME_PERIOD/this.xAxisPeriodWidth)*distance*60*1000;
	}
	/**
	 * Only meant to be used internally.
	 * Moves tooltip to unrealized PL box that is overlapping with current mouse pointer
	 * 
	 * Should ONLY be called internally.
	 */
	#moveTooltipOverlapPLBox(userPLInfo){
		if(this.mouseX >= userPLInfo.startX
				&& this.mouseX <= userPLInfo.endX
				&& this.mouseY >= userPLInfo.startY
				&& this.mouseY <= userPLInfo.endY
		){
			this.popoverDivEl.style.left = `${userPLInfo.startX }px`; // Offset to avoid overlap
			this.popoverDivEl.style.top = `${userPLInfo.endY}px`;
			this.popoverDivEl.innerHTML = UserSecPosUtils.getUserPositionSummaryHtml(this.userSecPosInfo[userPLInfo.userId]);
			this.popoverDivEl.style.display = "block";
			return true
		}
		return false;
	}		

	/**
	 *	Returns the distance of a candle from the end of chart 
	*/
	#getOffsetRightByCandlestick(candlestickIndex){
		return ((((this.lastXAxisTimestamp-this.curOhlcDataArr[candlestickIndex].timestamp)/1000)/60) / this.X_AXIS_TIME_PERIOD) * this.xAxisPeriodWidth;
	}
	/**
		Draw Security info like current security price etc.
		Needs to be above the candles.
	*/
	#drawUserSecurityHoldingInfo(){
		let priceRange = this.curMaxPrice-this.curMinPrice;
		/**
			Draw the latest price of security.
			Draw all user's current position if 	any.
		*/
		this.userPLInChartPosArr = [];	// {startY, endY, startX, endX}
		this.userPLOutChartPosArr = [];	// {startY, endY, startX, endX}
		for(const userId in this.userSecPosInfo){
			let userSecPos = this.userSecPosInfo[userId];
			if(userSecPos.ownedQuantity && userSecPos.ownedQuantity != 0){
				let avgFillPrice = userSecPos.ownedQuantity < 0 ? userSecPos.avgSellPrice : userSecPos.avgBuyPrice;
				if(!avgFillPrice){
					avgFillPrice = 0;	//edge case silent handling
				}
				let isUserPosWithinChart = avgFillPrice >= this.curMinPrice && avgFillPrice <= this.curMaxPrice;

				//Unrealized PL $ dimenstions. Length of string + 1 extra char padding on left & right.
				let unrealizedPLText = (userSecPos.unrealizedPL > 0 ? '+' : '') + userSecPos.unrealizedPL.toFixed(2)+" USD";
				let userPLWidth = this.defaultTextFontSize*unrealizedPLText.length;

				//avg buy price position on the chart
				let avgBuyPriceYPos;
				

				if(isUserPosWithinChart){
					avgBuyPriceYPos = Math.floor(this.candlestickHeight - (((avgFillPrice-this.curMinPrice)/priceRange) * this.candlestickHeight))+0.5;
				} else{
					//put everything right at bottom
					avgBuyPriceYPos = Math.floor(this.candlestickHeight - this.CHART_PL_BOX_HEIGHT/2)-5;
				}
				//Unrealized PL box start Y Position
				let userPLStartYPos = avgBuyPriceYPos - (this.CHART_PL_BOX_HEIGHT/2)

				let leftmostBoxXPos = Number.MAX_VALUE; //matters when current PL is within chart
				let rightmostBoxXPos = 0;   //matters when current PL is outside chart
				//figure out X position of PL box incase of collisions
				if(isUserPosWithinChart){
					this.userPLInChartPosArr.forEach(prevPLBoxPos => {
						if(userPLStartYPos < prevPLBoxPos.endY && userPLStartYPos + this.CHART_PL_BOX_HEIGHT > prevPLBoxPos.startY){
							leftmostBoxXPos = Math.min(leftmostBoxXPos, prevPLBoxPos.startX);
						}
					});
				} else{
					this.userPLOutChartPosArr.forEach(prevPLBoxPos => {
						if(userPLStartYPos < prevPLBoxPos.endY && userPLStartYPos + this.CHART_PL_BOX_HEIGHT > prevPLBoxPos.startY){
							rightmostBoxXPos = Math.max(rightmostBoxXPos, prevPLBoxPos.endX);
						}
					});
				}

				//Draw a straight line across the chart
				if(isUserPosWithinChart){
					this.candleCtx.strokeStyle = userSecPos.userInfo.color;
					this.candleCtx.lineWidth=1;
					this.candleCtx.beginPath();
					this.candleCtx.moveTo(0, avgBuyPriceYPos);
					this.candleCtx.lineTo(this.candlestickCanvas.width, avgBuyPriceYPos);
					this.candleCtx.stroke();
				}

				//hightlight avgBugPrice on YAxis as a colored box
				this.yAxisCtx.fillStyle=userSecPos.userInfo.color;
				this.yAxisCtx.fillRect(0,avgBuyPriceYPos - (this.Y_AXIS_PRICE_BOX_HEIGHT/2), this.Y_AXIS_WIDTH, this.Y_AXIS_PRICE_BOX_HEIGHT);
				this.yAxisCtx.textAlign = "center";
				this.yAxisCtx.textBaseline = "middle";
				this.yAxisCtx.fillStyle = "white";
				this.yAxisCtx.font = "400 "+this.defaultTextFontSize+"px "+this.chartFontFamily;
				this.yAxisCtx.fillText(avgFillPrice.toFixed(2), this.Y_AXIS_WIDTH/2, avgBuyPriceYPos);
				
				//Figure out starting X positions
				let userInitialStartXPos;
				if(isUserPosWithinChart & leftmostBoxXPos != Number.MAX_VALUE){
					userInitialStartXPos = leftmostBoxXPos - userPLWidth - this.INTER_PL_BOX_PADDING;    //20 px left from overlapping unrealizedPL
				} else if(!isUserPosWithinChart && rightmostBoxXPos != 0){
					userInitialStartXPos = rightmostBoxXPos + this.INTER_PL_BOX_PADDING    //20 px left from overlapping unrealizedPL
				} else{
					//no overlapping intervals
					if(isUserPosWithinChart){
						userInitialStartXPos = this.candlestickChartWidth-userPLWidth - this.CHART_PL_PADDING;    //Candlestick.CHART_PL_PADDING padding from right
					} else{
						userInitialStartXPos = this.CHART_PL_PADDING; //100px padding from left
					}
					
				}
				
				//Draw user Initials ie AK
				let userInitialsText = UserInfoSecPos.getUserInitials(userSecPos.userInfo);
				let userInitialsTextWidth = this.defaultTextFontSize*userInitialsText.length;
				this.candleCtx.fillStyle=userSecPos.userInfo.color;
				this.candleCtx.strokeStyle=userSecPos.userInfo.color;

				this.candleCtx.beginPath();
				this.candleCtx.moveTo(userInitialStartXPos + this.DEFAULT_BOX_BORDER_RADIUS, userPLStartYPos);
				this.candleCtx.lineTo(userInitialStartXPos + userInitialsTextWidth + this.DEFAULT_BOX_BORDER_RADIUS, userPLStartYPos);
				this.candleCtx.lineTo(userInitialStartXPos + userInitialsTextWidth + this.DEFAULT_BOX_BORDER_RADIUS, userPLStartYPos + this.CHART_PL_BOX_HEIGHT);
				this.candleCtx.lineTo(userInitialStartXPos + this.DEFAULT_BOX_BORDER_RADIUS, userPLStartYPos + this.CHART_PL_BOX_HEIGHT);
				this.candleCtx.quadraticCurveTo(userInitialStartXPos, userPLStartYPos + this.CHART_PL_BOX_HEIGHT, userInitialStartXPos, userPLStartYPos + this.CHART_PL_BOX_HEIGHT - this.DEFAULT_BOX_BORDER_RADIUS);
				this.candleCtx.lineTo(userInitialStartXPos, userPLStartYPos + this.DEFAULT_BOX_BORDER_RADIUS);
				this.candleCtx.quadraticCurveTo(userInitialStartXPos, userPLStartYPos, userInitialStartXPos + this.DEFAULT_BOX_BORDER_RADIUS, userPLStartYPos);
				this.candleCtx.fill();
				this.candleCtx.stroke();
				this.candleCtx.closePath();
				
				let userPLStartXPos = userInitialStartXPos + userInitialsTextWidth;
				this.candleCtx.beginPath();
				//Now Draw unrealized
				this.candleCtx.fillStyle="white";
				this.candleCtx.strokeStyle=userSecPos.userInfo.color;
				this.candleCtx.lineTo(userPLStartXPos + userPLWidth - this.DEFAULT_BOX_BORDER_RADIUS, userPLStartYPos);
				this.candleCtx.quadraticCurveTo(userPLStartXPos + userPLWidth, userPLStartYPos, userPLStartXPos + userPLWidth, userPLStartYPos + this.DEFAULT_BOX_BORDER_RADIUS);
				this.candleCtx.lineTo(userPLStartXPos + userPLWidth, userPLStartYPos + this.CHART_PL_BOX_HEIGHT - this.DEFAULT_BOX_BORDER_RADIUS);
				this.candleCtx.quadraticCurveTo(userPLStartXPos + userPLWidth, userPLStartYPos + this.CHART_PL_BOX_HEIGHT, userPLStartXPos + userPLWidth - this.DEFAULT_BOX_BORDER_RADIUS, userPLStartYPos + this.CHART_PL_BOX_HEIGHT);
				this.candleCtx.lineTo(userPLStartXPos, userPLStartYPos + this.CHART_PL_BOX_HEIGHT);
				this.candleCtx.lineTo(userPLStartXPos, userPLStartYPos);
				this.candleCtx.closePath();
				this.candleCtx.stroke();
				this.candleCtx.fill();
				
				//write unrealizedPL Text
				this.candleCtx.fillStyle = userSecPos.unrealizedPL < 0 ? this.redColor : this.greenColor;
				this.candleCtx.textAlign = "center";
				this.candleCtx.textBaseline = "middle";
				this.candleCtx.font = "400 "+this.defaultTextFontSize+"px "+this.chartFontFamily;
				this.candleCtx.fillText(unrealizedPLText, userPLStartXPos + userPLWidth/2, avgBuyPriceYPos);
				
				//write initials
				this.candleCtx.fillStyle = "white";
				this.candleCtx.fillText(userInitialsText, userInitialStartXPos + (userInitialsTextWidth )/2, avgBuyPriceYPos);
				this.candleCtx.closePath();

				let curPLBoxPositions = {userId: userId, startY: userPLStartYPos, endY: userPLStartYPos + this.CHART_PL_BOX_HEIGHT, startX: userInitialStartXPos, endX: userPLStartXPos + userPLWidth};
				if(isUserPosWithinChart){
					this.userPLInChartPosArr.push(curPLBoxPositions);
				} else{
					this.userPLOutChartPosArr.push(curPLBoxPositions);
				}
			}
		}
	}

	/**
		Draws background light-grey gridlines. Need to be below candles.
	*/
	#drawBgGridLines(pricePoints) {
		this.candleCtx.strokeStyle = this.gridLinesColor;
		this.candleCtx.lineWidth = 1;
		let priceRange = this.curMaxPrice-this.curMinPrice;
		
		// Draw Y-axis (price levels)           
		for (let i = 0; i < pricePoints.length; i++) {
			const y = Math.floor(this.candlestickHeight - (((pricePoints[i]-this.curMinPrice)/priceRange) * this.candlestickHeight))+0.5;
			if((y<this.defaultTextFontSize)
				|| (this.candlestickHeight-y < this.defaultTextFontSize)){
				continue;
			}
			const price = pricePoints[i];
			
			//Horizontal lines
			this.candleCtx.beginPath();
			this.candleCtx.strokeStyle = this.gridLinesColor;
			this.candleCtx.moveTo(0, y);
			this.candleCtx.lineTo(this.candlestickChartWidth, y);
			this.candleCtx.stroke();

			// Label price levels
			this.yAxisCtx.textAlign = "center";
			this.yAxisCtx.textBaseline = "middle";
			this.yAxisCtx.fillStyle = this.textColor;
			this.yAxisCtx.font = "400 "+this.defaultTextFontSize+"px "+this.chartFontFamily;
			this.yAxisCtx.fillText(price.toFixed(2), this.Y_AXIS_WIDTH/2, y);
		}
		
		//Draw latest candle box on yaxis
		if (this.curOhlcDataArr && this.curOhlcDataArr.length > 0){
			let yAxisVal = this.curOhlcDataArr[this.curOhlcDataArr.length-1].close;
			let yAxisPosVal= Math.floor(this.candlestickHeight - ((yAxisVal-this.curMinPrice)/priceRange) * this.candlestickHeight)+0.5;

			this.yAxisCtx.fillStyle=this.blueColor;
			this.yAxisCtx.fillRect(0,yAxisPosVal - (this.Y_AXIS_PRICE_BOX_HEIGHT/2), this.Y_AXIS_WIDTH, this.Y_AXIS_PRICE_BOX_HEIGHT);				
			this.yAxisCtx.textAlign = "center";
			this.yAxisCtx.textBaseline = "middle";
			this.yAxisCtx.fillStyle = "white";
			this.yAxisCtx.font = "400 "+this.defaultTextFontSize+"px "+this.chartFontFamily;
			this.yAxisCtx.fillText(yAxisVal.toFixed(2), this.Y_AXIS_WIDTH/2, yAxisPosVal);

			//draw a dotted line across
			this.candleCtx.strokeStyle = this.blueColor;
			this.candleCtx.lineWidth=1;
			this.candleCtx.setLineDash([1, 3]);
			this.candleCtx.beginPath();
			this.candleCtx.moveTo(0, Math.round(yAxisPosVal)+0.5);
			this.candleCtx.lineTo(this.candlestickCanvas.width, Math.round(yAxisPosVal)+0.5);
			this.candleCtx.stroke();
			this.candleCtx.setLineDash([]);
		}

		//show mouse hover point val
		if (this.mouseX && this.mouseY) {
			let yAxisHoverVal = this.curMaxPrice - (priceRange * (this.mouseY/this.candlestickHeight));
			
			this.yAxisCtx.fillStyle=this.textColor;
			this.yAxisCtx.fillRect(0,this.mouseY - (this.Y_AXIS_PRICE_BOX_HEIGHT/2), this.Y_AXIS_WIDTH, this.Y_AXIS_PRICE_BOX_HEIGHT);				
			this.yAxisCtx.textAlign = "center";
			this.yAxisCtx.textBaseline = "middle";
			this.yAxisCtx.fillStyle = this.gridLinesColor;
			this.yAxisCtx.font = "400 "+this.defaultTextFontSize+"px "+this.chartFontFamily;
			this.yAxisCtx.fillText(yAxisHoverVal.toFixed(2), this.Y_AXIS_WIDTH/2, this.mouseY);
		}

		// Draw X-axis (time intervals)
		let xAxisPointsNum = Math.ceil(this.candlestickChartWidth/this.xAxisPeriodWidth);
		
		let lastYAxisLineTimestamp = new Date(this.lastXAxisTimestamp);
		lastYAxisLineTimestamp.setUTCMinutes(Math.floor(lastYAxisLineTimestamp.getUTCMinutes()/this.X_AXIS_TIME_PERIOD)*this.X_AXIS_TIME_PERIOD, 0, 0);
		let prevYGridLineRightOffset = ((((this.lastXAxisTimestamp-lastYAxisLineTimestamp)/1000)/60) / this.X_AXIS_TIME_PERIOD) * this.xAxisPeriodWidth;
		let yGridLineRightOffset = prevYGridLineRightOffset;
		
		for (let i = 0; i < xAxisPointsNum; i++) {
			let yGridLineOffset = this.candlestickChartWidth-(this.xAxisPeriodWidth*i) - yGridLineRightOffset;
			this.candleCtx.beginPath();
			this.candleCtx.strokeStyle=this.gridLinesColor;
			this.candleCtx.moveTo(Math.round(yGridLineOffset)+0.5, 0);
			this.candleCtx.lineTo(Math.round(yGridLineOffset)+0.5, this.candlestickHeight);
			this.candleCtx.stroke();

			// Label time intervals
			let xAxisLabelDate = new Date(lastYAxisLineTimestamp - (i*this.X_AXIS_TIME_PERIOD*60*1000));
			this.xAxisCtx.textAlign = "center";
			this.xAxisCtx.textBaseline = "middle";
			this.xAxisCtx.fillStyle = this.textColor;
			this.xAxisCtx.font = "400 "+this.defaultTextFontSize+"px "+this.chartFontFamily;
			let displayHrs = xAxisLabelDate.getUTCHours()+"";
			if(displayHrs.length==1){
				displayHrs = "0"+displayHrs;
			}
			let displayMins = xAxisLabelDate.getUTCMinutes()+"";
			if(displayMins.length==1){
				displayMins = "0"+displayMins;
			}
			this.xAxisCtx.fillText(displayHrs+":"+displayMins, yGridLineOffset, this.X_AXIS_HEIGHT/2);
		}
	}

	// Draw dashed lines for mouse pointer
	#drawPointerLines() {
		if (this.mouseX && this.mouseY) {
			this.candleCtx.strokeStyle = this.mouseHoverLinesColor;
			this.candleCtx.lineWidth=1;
			this.candleCtx.setLineDash([7, 7]);
			this.candleCtx.beginPath();
			this.candleCtx.moveTo(Math.round(this.mouseX)+0.5, 0);
			this.candleCtx.lineTo(Math.round(this.mouseX)+0.5, this.candlestickCanvas.height);
			this.candleCtx.moveTo(0, Math.round(this.mouseY)+0.5);
			this.candleCtx.lineTo(this.candlestickCanvas.width, Math.round(this.mouseY)+0.5);
			this.candleCtx.stroke();
			this.candleCtx.setLineDash([]);

			// Show stats near mouse pointer
			this.#showStats(this.mouseX, this.mouseY);
		}
	}

	// Show stats based on mouse position
	#showStats(x, y) {
		/*const totCandlestickWidth = this.candlestickWidth + this.CANDLESTICK_SPACING;
		const index = Math.floor((x + dragOffset) / totCandlestickWidth);
		const data = this.candlestickDataArr[index];
		*/
		let totCandlestickWidth = this.candlestickWidth + this.CANDLESTICK_SPACING;
		let lastCandlestickRightOffset = this.#getOffsetRightByCandlestick(this.lastCandlestickIndex);
		let lastCandleXPosStart = Math.floor(this.candlestickChartWidth - lastCandlestickRightOffset)+(this.candlestickWidth / 2);
		let mouseHoverDataIndex;
		if(x >= lastCandleXPosStart){
			mouseHoverDataIndex = this.lastCandlestickIndex;
		} else{
			mouseHoverDataIndex = Math.max(0, this.lastCandlestickIndex - Math.floor((lastCandleXPosStart-x)/totCandlestickWidth));
		}
		
		let data = this.curOhlcDataArr[mouseHoverDataIndex];
		let color = this.#getCandlestickColor(data.open, data.close);
		if (data) {
			this.statsDivEl.innerHTML = `
				<div style="display:flex;align-items:center;justify-content:center;gap:0.75rem;font-size:13px;">
				<div>O <span style="color:${color}">${data.open.toFixed(5)}</span></div>
				<div>H <span style="color:${color}">${data.high.toFixed(5)}</span></div>
				<div>L <span style="color:${color}">${data.low.toFixed(5)}</span></div>
				<div>C <span style="color:${color}">${data.close.toFixed(5)}</span></div>
				</div>
				<div><i>Custom made chart using html canvas</i>😉</div>
				`;
		}
	}

	/**
		Determines if dragging possible
		Returns FALSE if dragging not possible due to abscense of data.
	**/
	#shiftDataRange(mouseDragOffset) {	
		if(mouseDragOffset == 0 || mouseDragOffset == this.prevDragOffset){	//no movement
			return false;
		}
		if ( (mouseDragOffset > this.prevDragOffset && this.lastCandlestickIndex == 0)	// User went to the left - show older data && Reached the oldest candlestick already. Cannot scroll past this
			|| (mouseDragOffset < this.prevDragOffset && this.lastCandlestickIndex == this.curOhlcDataArr.length-1)) {	// OR User went to the right - show newer data && cannot scroll in the future. In this case we can only see the latest candlestick
			this.#endDrag();
			this.#startDrag();
			return false;				
		}			
		return true;			
	}

	#getYAxisPoints(max, min) {
		const range = max - min;
		const cushion = range * 0.1; // 10% cushion

		let newMax = max+cushion;
		let newMin = Math.max(0, min-cushion);

		// Decide the number of Y-axis points
		const numPoints = range < this.MAX_Y_AXIS_LABEL_NUM ? this.MIN_Y_AXIS_LABEL_NUM : this.MAX_Y_AXIS_LABEL_NUM;
		
		//round starting point to nearest 10 multiple above newMin.
		let yAxisLastPointVal = Math.floor(newMax / 10) * 10;
		let yAxisFirstPointVal = Math.ceil(newMin / 10) * 10;
		//multiple of 10
		const step = Math.ceil((yAxisLastPointVal - yAxisFirstPointVal) / (numPoints-1) / 10) * 10;
		const yAxisPoints = [];
		for (let i = 0; i < numPoints; i++) {
			yAxisPoints.push(yAxisFirstPointVal + (i * step));
		}

		newMax = Math.max(newMax, yAxisPoints[yAxisPoints.length-1]);
		return {
			newMax,
			newMin,
			yAxisPoints
		};
	}

	#getCandlestickColor(open, close){
		return close > open ? this.greenColor : this.redColor;
	}
}


/**
 * TODO: Remove later. Only needed to generate random data.
 * The security info should be stoed in redux anyway
 */
export class UserSecurityPriceData {
	symbol;
	symbolFullName;
	minTradeableValue;

	constructor(symbol, symbolFullName, minTradeableValue){
		this.symbol = symbol;
		this.symbolFullName = symbolFullName;
		this.minTradeableValue = minTradeableValue;
	}

	// Placeholder for initializing chart data
	// generateRandomData() {
	// 	let min = 100;
	// 	let maxPosDeviation = 100;
	// 	let curDate = new Date();
	// 	curDate.setUTCSeconds(0, 0);
	// 	let curTimestamp = curDate.valueOf();
	// 	for (let i = 0; i < 50; i++) {
	// 		let openVal = min+Math.random() * maxPosDeviation + i;
	// 		let closeVal = min+Math.random() * maxPosDeviation + i;
	// 		this.ohlcCandleDataArr.unshift({
	// 			open: openVal,
	// 			high: (Math.random() * 10) + Math.max(openVal, closeVal),
	// 			low: Math.max(0,Math.min(openVal, closeVal) - (Math.random() * 30)),
	// 			close: closeVal,
	// 			timestamp: curTimestamp - (i*60*1000)
	// 		});
	// 	}
	// }
}