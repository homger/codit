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

    intersect_with(interval = _gd_interval){
        
    if(interval.end >= thisthis.start)
        return true;
    if(interval2.end >= interval.start)
        return true;
    }
}