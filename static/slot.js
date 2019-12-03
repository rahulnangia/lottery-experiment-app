/**
* Slot machine
* Author: Saurabh Odhyan | http://odhyan.com
*
* Licensed under the Creative Commons Attribution-ShareAlike License, Version 3.0 (the "License")
* You may obtain a copy of the License at
* http://creativecommons.org/licenses/by-sa/3.0/
*
* Date: May 23, 2011
*/
$(document).ready(function() {
    /**
    * Global variables
    */
    var age;
    var gender;
    var id;
    var bet;
    var balance = 5;
    var maxBet = 5;
    var completed = 0,
        imgHeight = 1374,
        posArr = [
            0, //1
            80, //6
            165, //5
            240, //4
            315, //3
            385, //2
            458, //1
            539, //6
            628, //5
            700, //4
            775, //3
            843, //2
            915, //1
            1000, //6
            1087, //5
            1160, //4
            1230, //3
            1300 //2
        ];
    plays=0;
    imgStarts = {1:0,6:1,5:2,4:3,3:4,2:5}
    var win = [];
    win[0] = win[458] = win[915] = 1;
    win[80] = win[539] = win[1000] = 2;
    win[165] = win[628] = win[1087] = 3;
    win[240] = win[700] = win[1160] = 4;
    win[315] = win[775] = win[1230] = 5;
    win[385] = win[843] = win[1300] = 6;

    var winningArr = [0,0,0,0,0,0];
    var winningStr = "000000";
    var treatment = false;
    var winLottery = false;
    var slotOutput = [0,0,0,0,0,0];
    var slotStr="";

    function setWinningArr(){
      $('#log').html("");
      assignWin();
      winningStr = "";
      for(i = 0; i < winningArr.length; i++) {
        winningArr[i] = getRandomIntInclusive(1,6);
        winningStr += winningArr[i];
      }
      calcSlotOutput();
      slotStr = "";
      for(i = 0; i < slotOutput.length; i++) {
        slotStr += slotOutput[i];
      }
    }

    function calcSlotOutput(){
      slotOutput = Array.from(winningArr);
      if(!winLottery){
        if(treatment){
          var digit = getRandomIntInclusive(0,5);
          alterOutput(slotOutput, digit, 1);
        }else{
          let digits = new Set();
          while(digits.size != 3){
            var digit = getRandomIntInclusive(0,5);
            while(digits.has(digit)){
              digit+=1;
              digit = digit % winningArr.length;
            }
            alterOutput(slotOutput, digit, 3);
            digits.add(digit);
          }
        }
      }
    }

    function alterOutput(arr, digit, incr){
      if(Math.random() <= 0.5){
        slotOutput[digit] = slotOutput[digit] + incr;
      }else{
        slotOutput[digit] = slotOutput[digit] - incr;
      }
      slotOutput[digit] = slotOutput[digit] % slotOutput.length;
      if(slotOutput[digit]==0){
        slotOutput[digit]=6;
      }
    }

    function assignWin(){
      winLottery = Math.random() <= 0.2;
    }

    function assignTreatment(){
      treatment = Math.random() <= 0.5;
    }

    $("#play-btn").click(function () {
      assignTreatment();
      age = $("#age").val();
      gender = $("#gender").val();
      id = $("#id").val();
      setWinningArr();
      $('#slot-machine').show();
      $('#balance').text(formatter.format(balance));
      $('#winning-lottery').text(winningStr);
    })

    /**
    * @class Slot
    * @constructor
    */
    function Slot(el, max, step) {
        this.id = step;
        this.speed = 0; //speed of the slot at any point of time
        this.step = step; //speed will increase at this rate
        this.si = null; //holds setInterval object for the given slot
        this.el = el; //dom element of the slot
        this.maxSpeed = max; //max speed this slot can have
        this.pos = null; //final position of the slot

        $(el).pan({
            fps:30,
            dir:'down'
        });
        $(el).spStop();
    }

    /**
    * @method start
    * Starts a slot
    */
    Slot.prototype.start = function() {
        var _this = this;
        $(_this.el).addClass('motion');
        $(_this.el).spStart();
        _this.si = window.setInterval(function() {
            if(_this.speed < _this.maxSpeed) {
                _this.speed += _this.step;
                $(_this.el).spSpeed(_this.speed);
            }
        }, 100);
    };

    /**
    * @method stop
    * Stops a slot
    */
    Slot.prototype.stop = function() {
        var _this = this,
            limit = 30;
        clearInterval(_this.si);
        _this.si = window.setInterval(function() {
            if(_this.speed > limit) {
                _this.speed -= _this.step;
                $(_this.el).spSpeed(_this.speed);
            }
            if(_this.speed <= limit) {
                _this.finalPos(_this.el);
                $(_this.el).spSpeed(0);
                $(_this.el).spStop();
                clearInterval(_this.si);
                $(_this.el).removeClass('motion');
                _this.speed = 0;
            }
        }, 100);
    };

    /**
    * @method finalPos
    * Finds the final position of the slot
    */
    Slot.prototype.finalPos = function() {
        var el = this.el,
            el_id,
            pos,
            posMin = 2000000000,
            best,
            bgPos,
            i,
            j,
            k;

        el_id = $(el).attr('id');
        //pos = $(el).css('background-position'); //for some unknown reason, this does not work in IE
        pos = document.getElementById(el_id).style.backgroundPosition;
        pos = pos.split(' ')[1];
        pos = parseInt(pos, 10);
        i= imgStarts[slotOutput[this.id-1]];
        for(; i < posArr.length; i+=6) {
          for(j = 0;;j++) {
              k = posArr[i] + (imgHeight * j);
              if(k > pos) {
                  if((k - pos) < posMin) {
                      posMin = k - pos;
                      best = k;
                      this.pos = posArr[i]; //update the final position of the slot
                  }
                  break;
              }
          }
        }

        best += imgHeight + 4;
        bgPos = "0 " + best + "px";
        $(el).animate({
            backgroundPosition:"(" + bgPos + ")"
        }, {
            duration: 200,
            complete: function() {
                completed ++;
            }
        });
    };

    /**
    * @method reset
    * Reset a slot to initial state
    */
    Slot.prototype.reset = function() {
        var el_id = $(this.el).attr('id');
        $._spritely.instances[el_id].t = 0;
        $(this.el).css('background-position', '0px 4px');
        this.speed = 0;
        completed = 0;
        $('#result').html('');
    };

    function enableControl() {
        $('#control').attr("disabled", false);
        $('#bet').attr("disabled", false);
    }

    function disableControl() {
        $('#control').attr("disabled", true);
        $('#bet').attr("disabled", true);
    }

    function printResult() {
        var res;
        plays+=1;
        // if(win[a.pos] === win[b.pos] && win[a.pos] === win[c.pos]) {
        if(winLottery) {
            res = "You Win!";
            balance = balance + (2 * parseFloat($('#bet').val()));
            $('#balance').text(formatter.format(balance));
        } else {
            res = "You Lose";
        }
        $('#result').html(res);
        $.ajax({
          type: "POST",
          url: "/insert",
          data: {'uid':id, 'age':age, 'gender':gender,'balance':balance,'bet':bet,'win':winLottery,'treatment':treatment,'plays':plays, 'wticket':winningStr, 'uticket':slotStr},
          success: function(response){
            console.log(response);
            $('#log').html("Logging Successful");
          },
          error: function(response){
            console.log(response);
            $('#log').html("Logging Failed");
          }
        })
    }

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  }

    //create slot objects
    var a = new Slot('#slot1', 30, 1),
        b = new Slot('#slot2', 45, 2),
        c = new Slot('#slot3', 70, 3),
        d = new Slot('#slot4', 90, 4),
        e = new Slot('#slot5', 110, 5),
        f = new Slot('#slot6', 130, 6);

    /**
    * Slot machine controller
    */
    $('#control').click(function() {
        var x;
        if(this.innerHTML == "Start") {
            bet = parseFloat($('#bet').val());
            if(parseFloat($('#bet').val()) > balance) {
              alert("Bet should be less than or equal to the balance amount!")
              return false;
            }
            if(parseFloat(balance >= maxBet)) {
              alert("Maximum balance reached. Cannot play more!")
              return false;
            }
            balance = balance-$('#bet').val();
            $('#balance').text(formatter.format(balance));
            a.start();
            b.start();
            c.start();
            d.start();
            e.start();
            f.start();
            this.innerHTML = "Stop";

            disableControl(); //disable control until the slots reach max speed

            //check every 100ms if slots have reached max speed
            //if so, enable the control
            x = window.setInterval(function() {
                if(a.speed >= a.maxSpeed && b.speed >= b.maxSpeed && c.speed >= c.maxSpeed && d.speed >= d.maxSpeed && e.speed >= e.maxSpeed && f.speed >= f.maxSpeed) {
                    enableControl();
                    window.clearInterval(x);
                }
            }, 100);
        } else if(this.innerHTML == "Stop") {
            a.stop();
            b.stop();
            c.stop();
            d.stop();
            e.stop();
            f.stop();
            this.innerHTML = "Reset";

            disableControl(); //disable control until the slots stop

            //check every 100ms if slots have stopped
            //if so, enable the control
            x = window.setInterval(function() {
                if(a.speed === 0 && b.speed === 0 && c.speed === 0 && d.speed === 0 && e.speed === 0 && f.speed === 0 && completed == 6) {
                    enableControl();
                    window.clearInterval(x);
                    printResult();
                }
            }, 100);

            if(balance === 0) {
              $('#balance').attr("style", "color: red");
              return false;
            }
        } else { //reset
            a.reset();
            b.reset();
            c.reset();
            d.reset();
            e.reset();
            f.reset();
            this.innerHTML = "Start";
            setWinningArr();
            $('#winning-lottery').text(winningStr);

        }
    });
});
