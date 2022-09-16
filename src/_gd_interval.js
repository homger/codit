'use strict';

//INTERVAL CALSS TO USE IN _gd_sandbox_editor.js
// use only positive integer
class _gd_interval{
    constructor(start = -1, end = -1, id = null){
            
        if(start == end){
            throw new Error("Bad arguments : Interval start == interval end");
        }
        this.start = start;
        this.end = end;
        if(this.start > this.end){
            this.start = end;
            this.end = start;
        }
        this.id = id;
    }
    get length(){
        return this.start - this.end;
    }
    checkOrder(){
        if(this.start > this.end){
            let e = end;
            this.end = this.start;
            this.start = e;
        }
    }
    start_increment(i){
        this.start += i;
        this.checkOrder();
    }
    end_increment(i){
        this.end += i;
        this.checkOrder();
    }
    augment(i = 1){
        if(i < 1){
            throw new Error("Invalid augment value :  i = " + i);
        }
        this.end_increment(i);
    }
    decrease(i = -1){
        if(i > -1){
            throw new Error("Invalid decrease value :  i = " + i);
        }
        this.end_increment(i);
    }
    shift(i){
        this.end += i;
        this.start += i;
    }
    has_intersection_with(interval){
        
        if(interval.start <= this.start && this.start <= interval.end || this.start <= interval.start && interval.start <= this.end)
            return true;
        
        return false;
    }

    contains_interval(interval){
        if(this.start <= interval.start && this.end >= interval.end)
            return true;
        
        return false;
    }

    //change the calling interval
    combine_interval(interval){
        if(interval.start < this.start)
            this.start = interval.start;
        
        if(interval.end > this.end)
            this.end = interval.end;
    }
    fuse_with_interval(interval){
        this.combine_interval(interval);
    }
    
    //change the calling interval
    //make this interal into a intersection of itself and the interval passed as argument
    intersect_interval(interval){
        if(this.has_intersection_with(interval)){
            if(interval.start > this.start)
                this.start = interval.start;
            
            if(interval.end < this.end)
                this.end = interval.end;
        }
    }

    //returns the interval in witch this interval intersect with the passed interval or undefined if there is no intersection
    get_intersection_interval(interval){
        if(this.has_intersection_with(interval)){
            let start = this.start;
            let end = this.end;

            if(interval.start > start)
                start = interval.start;
            
            if(interval.end < end)
                end = interval.end;
            
            return new _gd_interval(start, end);
        }

        
        return undefined;
    }
    
    
    //Intervals should be ordered by their start value.
    //Intervals id should be unique...
    static nested_interval_range_from_interval_list(intervalArray = _2_test_inntervalArray){
        let nested_Interval_Array = [];
        let nested_Interval_Map = new Map();
        

        //let interval_state_map = [];
        let interval_state_map = new Map(); // SWITCH TO MAP SO INTERVAL ID CAN BE "ANYTHING"



        // sets interval id since i don't bother seting it for now
        // " nested_Interval_Map " gcollects each point where there is an interval start or end. 
        // Groups together interval ID's that have a start or end or either at the same point.
        intervalArray.forEach((interval, index) => {
            if(interval.id === null)
                interval.id = index + 1;
            /*else if(isNaN(interval.id) ){
                throw new Error("Interval.id should be a number" );
            }*/
            //interval_state_map.push([false, interval.id]);
            interval_state_map.set(interval.id, [false, interval.id]);
            if(nested_Interval_Map.has(intervalArray[index].start)){
                nested_Interval_Map.get(intervalArray[index].start).push(interval.id);
            }
            else{
                nested_Interval_Map.set(intervalArray[index].start, [interval.id]);
            }

            if(nested_Interval_Map.has(intervalArray[index].end)){
                nested_Interval_Map.get(intervalArray[index].end).push(interval.id);
            }
            else{
                nested_Interval_Map.set(intervalArray[index].end, [interval.id]);
            }

        });
        // sorted_by_keys_nested_Interval_Array what the name says. 
        // The keys are Equal to each point of the interval range where there is a start, end or both.
        let sorted_by_keys_nested_Interval_Array = Array.from(nested_Interval_Map).sort(function(a,b){
            if(a[0] < b[0]){
                return -1;
            }
            if(a[0] > b[0]){
                return 1;
            }
            return 0;
        });


        
        let autoStackArray = new First_In_First_Out_Stack(); // to keep in memory the order in witch the interval are opened.

        let transferAuTostack = new First_In_First_Out_Stack(); /* 
        for wen interval [X] has to be closed. al interval opened after [X] will be stocked inside including [X] itself.
        The interval in transferAuToStack other than [X] will then be reopened, unless they were marked to be closed at the same point as x.
        */

        //huh..
        //comment inside..
        sorted_by_keys_nested_Interval_Array.forEach((changeIntervalPoint, index) => {
            
            let open_action_array = []; //For when an interval will be opened
            let close_action_array = []; // For when an interval will be closed temporarily or definitely
            let reopen_action_array = []; // To reopen an interval that was closed Temporarily.

            
            
            
            changeIntervalPoint[1].forEach(intervalId => {

                //1. for each point of change i open or close the intervals listed depending on their prior state.
                // if sloted to open they are added to the open_action_array and later to autoStackArray to avoid a bad order.
                // if sloted to close we transfer them from autoStackArray to transferAuTostack, 
                // automaticaly transfering the intervals opened after the target one to autoStackArray as well
                if(interval_state_map.get(intervalId)[0] === false){
                    interval_state_map.get(intervalId)[0] = true;
                    
                    //autoStackArray.add(intervalId);
                    open_action_array.push(intervalId);
                }
                else if(interval_state_map.get(intervalId)[0] === true){
                    interval_state_map.get(intervalId)[0] = false;
                    if(autoStackArray.has(intervalId)){

                        autoStackArray.transferUntilValueFound(intervalId, transferAuTostack);
                        
                        transferAuTostack.add(autoStackArray.remove());
                        
                    }
                    /*else{
                        //can't happen
                        //close_action_array.push(intervalId);
                    }*/
                }
                else{
                    throw new Error("Wrong data : interval_state_map[intervalId]   : "  +  interval_state_map.get(intervalId)[0]);
                }
            });

            //let open_close_action_array = [];

            console.log("Stack array :  " + autoStackArray.stackArray);

            // All the intervals(id) in transferAuTostack are added to close_action_array.
            transferAuTostack.foreEach((id) => {
                
                close_action_array.push(id);
            });

            // We go through transferAuTostack in reverse order to create "reopen_action_array".
            // first the interval is removed from transferAuToStack/
            // then tested to see if it still open. if so it is added to autoStackArray and then to reopen_action_array.
            transferAuTostack.foreEach_REVERSE(id => {
                transferAuTostack.remove();
                if(interval_state_map.get(id)[0]){
                    autoStackArray.add(id);
                    reopen_action_array.push(id);
                }
            });
            
            //Here the interval opened for the first time are finally added to autoStackArray to conserve the opening and closing order.
            open_action_array.forEach(interval_id => autoStackArray.add(interval_id));

            
            //The final step. A new entry is created in nested_Interval_Array witch an array of two elements. The index of the interval change.
            // and a array containing: 
            // 1: the intervals to close in good order, 
            // 2: then the intervals to reopen in good order, 
            // 3: finally the intervals that will be opened for the first time in a non-optimised order
            nested_Interval_Array.push([changeIntervalPoint[0], close_action_array.concat(reopen_action_array, open_action_array)]);
        });        
        return nested_Interval_Array;
    }
    //CHECKS FIRST AND TRHOWS ERROR IF NOT ORDERED as asked
    static nested_interval_range_from_interval_list_CHECK(intervalArray){
        intervalArray.forEach((value, index) => {
            if(index > 0){
                if(value.start < intervalArray[index - 1])
                    throw new Error("intervalArray is not ordered by interval start value");
            }
        });
        
        return nested_interval_range_from_interval_list(intervalArray);
    }
    
}

/*
description before i forget what i did: _[number]_test_inntervalArray_result_after_nested___ 
is the result of _[number]_test_inntervalArray passing through the function: nested_interval_range_from_interval_list

and huh... i have a png of what _2_test_inntervalArray represent it should be easy that way:
in the help folder : "nested interval array.png"

the function : nested_interval_range_from_interval_list should only produce a "slim" array:

_2_slim_test_inntervalArray_result_after_nested___ and NOT _2_test_inntervalArray_result_after_nested___

*/

const _1_test_inntervalArray = [new _gd_interval(1,5), new _gd_interval(3,9),];
const _1_test_inntervalArray_result_after_nested___ = [
    [1,[1]],
    [3,[1,1,2]],
    [5,[2,1,2]],
    [9,[2]],
];

const _2_test_inntervalArray = [new _gd_interval(0,25), new _gd_interval(5,15), new _gd_interval(7,22), new _gd_interval(11,14),];
const unordered__2_test_inntervalArray = [ new _gd_interval(11,14), new _gd_interval(5,15), new _gd_interval(0,25), new _gd_interval(7,22),];
const _2_test_inntervalArray_result_after_nested___ = [
    [0,[1]],
    [5,[1,1,2]],
    [7,[2,1,1,2,3]],
    [11,[3,2,1,1,2,3,4]],
    [14,[4,3,2,1,1,2,3]],
    [15,[3,2,1,1,3]],
    [22,[3,1,1]],
    [25,[1]],
];
const _2_slim_test_inntervalArray_result_after_nested___ = [
    [0,[1]],
    [5,[2]],
    [7,[3]],
    [11,[4]],
    [14,[4]],
    [15,[3,2,3]],
    [22,[3]],
    [25,[1]],
];




//FOR _gd_interval
// foreEach_REVERSE calssic for each, but goes from the last element to the first.
// foreEach
// has
// add ignore undefined
// remove remove and return the last element.
// viewTop return the last element
// transferUntilValueFound and transferAll give itself as argument to the callback.
class First_In_First_Out_Stack{
    constructor(){
        this.stackArray = [];
        this.length = 0;
    }
    foreEach_REVERSE(callBack){
        let i = this.length - 1;
        while(i >= 0){
            callBack(this.stackArray[i], i, this.stackArray);
            --i;
        }
    }
    foreEach(callBack){
        let i = 0;
        while(i < this.length){
            callBack(this.stackArray[i], i, this.stackArray);
            ++i;
        }
    }
    has(value){
        return this.stackArray.includes(value);
    }
    // Wil NOT add undefined as a value 
    add (value){
        if(value === undefined)
            return;
        this.stackArray.push(value);
        ++this.length;
    }
    remove (){
        if(this.length === 0){
            return undefined;
        }
        --this.length;
        return this.stackArray.pop();
    }
    viewTop (){
        return this.stackArray[this.length - 1];
    }
    //does not transfer value
    transferUntilValueFound (value, First_In_First_Out_Stack_Object, callBackFunction = undefined){

        if(callBackFunction !== undefined){
            while(this.viewTop() !== value && this.length > 0){
                callBackFunction(this);
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
        else{
            while(this.viewTop() !== value && this.length > 0){
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
    }
    transferAll (First_In_First_Out_Stack_Object,  callBackFunction = undefined){
        if(callBackFunction !== undefined){
            while(this.length > 0){
                callBackFunction(this);
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
        else{
            while(this.length > 0){
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
    }
    
}

//This class should contain a abitrary number of intervals.
//The intervals cannot intersect i don't know. There can be space between intervals
//When an interval is [augment] or [decrease] the following intervals and only them will be shifted by an equal value.
class _gd_interval_sector{
    constructor(){
        this.intervalArray = [];
    }
    addInterall(new_interval = new _gd_interval(0,0)){

        for (let i = 0; i < this.intervalArray.length; ++i){
            if(this.intervalArray[i].has_intersection_with(new_interval)){
                throw new Error("Recived interval intersect within interval_sector.\n new_nterval : " + new_interval + " || Interval_sector interval : " + this.intervalArray[i]);
            }

            if(new_interval.start < this.intervalArray[i].start){
                this.intervalArray.splice(i, 0, new_interval);
                //huh...
                this.updateIds(i);
                return;
            }
        }
        
        new_interval.id = this.intervalArray.length;
        this.intervalArray.push(new_interval);
        
    }
    updateIds(start_at = 0){
        for(start_at; start_at < this.intervalArray.length; ++start_at){
            this.intervalArray[start_at].id = start_at;
        }
    }
    augment_interval_i(i){
        this.intervalArray[i].augment();
        ++i;
        for(i; i < this.intervalArray.length; ++i){
            this.intervalArray[i].shift(1);
        }
    }

    decrease_interval_i(i){
        this.intervalArray[i].decrease();
        ++i;
        for(i; i < this.intervalArray.length; ++i){
            this.intervalArray[i].shift(-1);
        }
    }
    
    shift_sectors_start_at(i){
        for(let start = this.intervalArray.length - 1; start >= i ; --start){
            this.intervalArray[start].shift(1);
        }   
    }
    shift_by_x_sectors_start_at(i, shift_by){
        if( shift_by < 1){
            throw new Error("shift_by < 1")
        }
        for(let start = this.intervalArray.length - 1; start >= i ; --start){
            this.intervalArray[start].shift(1, shift_by);
        }   
    }

    unshift_sectors_start_at(i){
        if(i > 0 &&  (this.intervalArray[i].start - 1) ==  this.intervalArray[i - 1].end){
            throw new Error("Invalid shifting command interval_sector intersect \n." + 
            "this.intervalArray[i].start - 1) ==  this.intervalArray[i - 1].end : " + (this.intervalArray[i].start - 1) + " == " + his.intervalArray[i - 1].end);
        }
        for(i; i < this.intervalArray.length; ++i){
            this.intervalArray[i].shift(-1);
        }
    }

    unshift_by_x_sectors_start_at(i, unshift_by){
        if( unshift_by > -1){
            throw new Error("unshift_by > -1")
        }
        if(i > 0 &&  (this.intervalArray[i].start + unshift_by) <=  this.intervalArray[i - 1].end){
            throw new Error("Invalid shifting command interval_sector intersect or fall behind \n." + 
            "this.intervalArray[i].start + unshift_by) <=  this.intervalArray[i - 1].end : " + (this.intervalArray[i].start + unshift_by) + " <= " + his.intervalArray[i - 1].end);
        }
        for(i; i < this.intervalArray.length; ++i){
            this.intervalArray[i].shift(unshift_by);
        }
    }
}
