// ==UserScript==
// @name         Steam Queue Farmer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Gives the option to automatically complete your steam queues for the cards
// @author       You
// @match        https://store.steampowered.com/explore*
// @match        https://store.steampowered.com/app*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var remaining = 11;
    var queuesRemaining = 3;

    function setQueuesRemaining(){
        queuesRemaining = $J('.farmNumSelector').val();
    }

    //Place various UI elements on the page for the user to interact with
    function placeUI(){
        $J('.discovery_queue_apps').css('padding-bottom', '40px');

        var farmButton = '<div class="btnv6_blue_hoverfade btn_medium btn_farm_cards" style="margin-top: 10px;">';
        farmButton += '<span>Automate your queue</span>';
        farmButton += '</div>';

        var loadingSpinner = '<div class="farmLoadingSpinner">';
        loadingSpinner += ' <svg class="lds-blocks" style="margin-top: 13px;" width="38px" height="38px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style="background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%;"><rect x="19" y="19" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0s" calcMode="discrete"></animate> </rect><rect x="40" y="19" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.125s" calcMode="discrete"></animate> </rect><rect x="61" y="19" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.25s" calcMode="discrete"></animate> </rect><rect x="19" y="40" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.875s" calcMode="discrete"></animate> </rect><rect x="61" y="40" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.375s" calcMode="discrete"></animate> </rect><rect x="19" y="61" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.75s" calcMode="discrete"></animate> </rect><rect x="40" y="61" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.625s" calcMode="discrete"></animate> </rect><rect x="61" y="61" width="20" height="20" fill="#17212F"> <animate attributeName="fill" values="#5699d2;#17212F;#17212F" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.5s" calcMode="discrete"></animate> </rect></svg>';
        loadingSpinner += '</div>';

        var farmCountdowns = '<div style="margin-left: 2px;margin-top: 4px;font-family: \'Motiva Sans\', Sans-serif; font-weight: 300;">';
        farmCountdowns += '<div><span class="farmCountdownText">Games: </span><span class="farmCountdown"></span></div>';
        farmCountdowns += '<div><span class="farmCountdownText">Queues: </span><span class="farmQueueCountdown"></span></div>';
        farmCountdowns += '</div>';

        var numQueuesSelector = '<select class="farmNumSelector" style="margin-top: 10px;margin-right: 10px; color: #67c1f5 !important;background: rgba( 103, 193, 245, 0.2 ); border: none;">';
        numQueuesSelector += '<option value="1" style="color: #67c1f5 !important;background: #305F82 !important;">1 time</option>';
        numQueuesSelector += '<option value="2" style="color: #67c1f5 !important;background: #305F82 !important;;">2 times</option>';
        numQueuesSelector += '<option value="3" selected="selected" style="color: #67c1f5 !important;background: #305F82 !important;;">3 times</option>';
        numQueuesSelector += '</select> ';

        var farmInputsSection = '<div class="farmUIInputs" style="display: flex; justify-content: center;">';
        farmInputsSection += numQueuesSelector;
        farmInputsSection += farmButton;
        farmInputsSection += '</div>';

        var farmLoadingSection = '<div class="farmUILoading" style="display: none; text-align: center; font-size: 16px;">';
        farmLoadingSection += loadingSpinner;
        farmLoadingSection += farmCountdowns;
        farmLoadingSection += '</div>';

        
        var farmUI = farmInputsSection;
        farmUI += farmLoadingSection;

        $J('select.inpSelect').css('-webkit-appearance', 'none');

        $J('.discovery_queue_apps').append(farmUI);

        $J('.btn_farm_cards').on('click', function(){
            updateCountdown();
            generateFarmQueue();
        });

        $J('.farmNumSelector').on('click', function(){
            setQueuesRemaining();
        });
    }

    //Show the number of games left in the queue on the UI
    function updateCountdown(){
        $J('.farmCountdown').html(remaining);
        $J('.farmQueueCountdown').html(queuesRemaining);
        $J('.farmUIInputs').slideUp(function(){
            $J('.farmUILoading').slideDown();
        });
    }


    //If we're already on a game page, get the remaining number in the queue
    function findRemainingCount(){
        if ($J(".queue_sub_text").length){
            remaining = parseInt($J(".queue_sub_text").html().match(new RegExp('\\((.*) r'))[1]);
            updateCountdown();
            console.log(remaining + ' remaining in the queue.');
        }
    }

    //Generate a new queue and begin the cycle
    function generateFarmQueue(){
        console.log('Generating queue...');
        $J.post( 'https://store.steampowered.com/explore/generatenewdiscoveryqueue', {
            sessionid: g_sessionID,
            queuetype: 0,
        }).done(function(data){
            console.log('Getting first game...');

            //Get webpage of first in queue
            $J.ajax({
                type:"GET",
                url:"https://store.steampowered.com/explore/next",
                success:function(data) {
                    console.log('First game found. Cycling through queue...');
                    remaining = parseInt($J(data).find(".queue_sub_text").html().match(new RegExp('\\((.*) r'))[1]);
                    updateCountdown();
                    console.log('Remaining: ' + remaining);
                    nextInQueue(data);
                },
                error:function(){
                    console.log('Error finding the first game');
                }
            });
        }).fail( function() {
            console.log('Error connecting to steam, please try again in 10 seconds...');
        });
    };

    function nextInQueue(firstGameHTML){
        firstGameHTML = $J.parseHTML(firstGameHTML);
        var originalForm = $J(firstGameHTML).find("#next_in_queue_form");

        var postURL = originalForm.attr("action");
        var params = originalForm.serialize();

        $J.post(postURL, params, function(data){
            var nextPageForm = $J(data).find("#next_in_queue_form")[0];
            if (nextPageForm && nextPageForm.length && remaining > 0){
                remaining--;
                if (remaining <= 0){
                    queuesRemaining--;
                }
                updateCountdown();
                console.log('Remaining: ' + remaining);

                originalForm.parent().html(nextPageForm);
                nextInQueue(data);
            }
            else{
                console.log('Done with queue. ' + queuesRemaining + ' queues remaining.');
                updateCountdown();
                if (queuesRemaining == 0){
                    console.log('All queues completed. Refreshing the page...');
                    location.href = 'https://store.steampowered.com/explore/';
                }
                else{
                    generateFarmQueue();
                }
            }
        })
            .fail(function() {
            console.log('Failure');
        });
    }

    findRemainingCount();
    placeUI();

    console.log('Steam Queue Farmer initiated.');
})();
