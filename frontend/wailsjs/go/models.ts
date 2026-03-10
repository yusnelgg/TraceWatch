export namespace main {
	
	export class APIResult {
	    url: string;
	    status: number;
	    latency: number;
	    latencyDNS: number;
	    latencyConnect: number;
	    latencyTLS: number;
	    latencyTTFB: number;
	    error: string;
	    time: string;
	    responseSize: number;
	    contentType: string;
	    server: string;
	    sslEnabled: boolean;
	    sslValid: boolean;
	    sslExpiryDays: number;
	    httpVersion: string;
	    redirectCount: number;
	    finalURL: string;
	    upstreamStatusCode: number;
	
	    static createFrom(source: any = {}) {
	        return new APIResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.status = source["status"];
	        this.latency = source["latency"];
	        this.latencyDNS = source["latencyDNS"];
	        this.latencyConnect = source["latencyConnect"];
	        this.latencyTLS = source["latencyTLS"];
	        this.latencyTTFB = source["latencyTTFB"];
	        this.error = source["error"];
	        this.time = source["time"];
	        this.responseSize = source["responseSize"];
	        this.contentType = source["contentType"];
	        this.server = source["server"];
	        this.sslEnabled = source["sslEnabled"];
	        this.sslValid = source["sslValid"];
	        this.sslExpiryDays = source["sslExpiryDays"];
	        this.httpVersion = source["httpVersion"];
	        this.redirectCount = source["redirectCount"];
	        this.finalURL = source["finalURL"];
	        this.upstreamStatusCode = source["upstreamStatusCode"];
	    }
	}
	export class HealthCheckResult {
	    url: string;
	    healthy: boolean;
	    statusCode: number;
	    responseTimeMs: number;
	    error: string;
	    timestamp: string;
	
	    static createFrom(source: any = {}) {
	        return new HealthCheckResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.healthy = source["healthy"];
	        this.statusCode = source["statusCode"];
	        this.responseTimeMs = source["responseTimeMs"];
	        this.error = source["error"];
	        this.timestamp = source["timestamp"];
	    }
	}
	export class BatchHealthCheck {
	    results: HealthCheckResult[];
	    // Go type: struct { Total int "json:\"total\""; Healthy int "json:\"healthy\""; Unhealthy int "json:\"unhealthy\""; AvgLatency int64 "json:\"avgLatency\"" }
	    summary: any;
	
	    static createFrom(source: any = {}) {
	        return new BatchHealthCheck(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.results = this.convertValues(source["results"], HealthCheckResult);
	        this.summary = this.convertValues(source["summary"], Object);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

