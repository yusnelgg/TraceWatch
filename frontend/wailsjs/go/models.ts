export namespace main {
	
	export class APIResult {
	    url: string;
	    status: number;
	    latency: number;
	    error: string;
	    time: string;
	
	    static createFrom(source: any = {}) {
	        return new APIResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.status = source["status"];
	        this.latency = source["latency"];
	        this.error = source["error"];
	        this.time = source["time"];
	    }
	}

}

