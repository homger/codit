'use strict';

class _gd_event{
    constructor(){

        this.eventNameList = new Map();
        //this.makeEventObject = this.makeEventObject.bind(this);
    }

    //removed the checks so that user can know if he did something wrong
    addEventListener(name, callFunction){
        /*if(this.eventNameList.has(name)){
            this.eventNameList.get(name).callFunctionList.add(callFunction);
        }*/
        this.eventNameList.get(name).callFunctionList.add(callFunction);
    }
    removeEventListener(name, callFunction){
        /*if(this.eventNameList.has(name)){
            this.eventNameList.get(name).callFunctionList.delete(callFunction);
        }*/
        this.eventNameList.get(name).callFunctionList.delete(callFunction);
    }

    __addEventType(name, eventObjectNameArray){
        this.eventNameList.set(name, {eventObjectNameArray: eventObjectNameArray, callFunctionList: new Set()});
    }

    dispatchEvent(eventName){
        
        if(this.eventNameList.has(eventName)){

            let cach = this.eventNameList.get(eventName);
            let dispatchObject = this.make_ObjectToDispatchWith_Event(cach.eventObjectNameArray);
            //debugger;
            cach.callFunctionList.forEach(callFunction => callFunction(dispatchObject) );
            return;
        }
        throw new Error("dispatchEvent(eventName)  eventName not found");
    }

    make_ObjectToDispatchWith_Event(eventObjectNameArray){
        let eventObj = {};
        eventObjectNameArray.forEach(name => eventObj[name] = this[name]);

        return eventObj;
    }

}
