'use strict';


class _gd_interval{
    constructor(start, end){
            
        this.start = start;
        this.end = end;
        if(start > end){
            this.start = end;
            this.end = start;
        }
    }

    has_intersection_with(interval){
        
        if(interval.start <= this.start && this.start <= interval.end || this.start <= interval.start && interval.start <= this.end)
            return true;
        
        return false;
    }

    combine_interval(interval){
        if(interval.start < this.start)
            this.start = interval.start;
        
        if(interval.end > this.end)
            this.end = interval.end;
    }
    
    intersect_interval(interval){
        if(this.has_intersection_with(interval)){
            if(interval.start > this.start)
                this.start = interval.start;
            
            if(interval.end < this.end)
                this.end = interval.end;
        }
    }
}