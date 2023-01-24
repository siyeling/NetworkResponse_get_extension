let currentTab;
const version = "1.3";


chrome.action.onClicked.addListener(() => {
    console.log('起動')
    chrome.tabs.query(
        //発火させたタブを取得
        {
            currentWindow: true,
            active: true
        },
        (tabArray) => {
            currentTab = tabArray[0];
            //指定タブに接続
            chrome.debugger.attach({
                tabId: currentTab.id
            },
            version,
            ()=>{
                console.log(`${currentTab.id}に接続成功`);

                let count = 0;

                chrome.debugger.sendCommand({
                    tabId:currentTab.id
                },
                "Network.enable"
                );

                


                chrome.debugger.onDetach.addListener((debuggee,detachReason)=>{
                    console.log(`${debuggee.tabId}から後述の理由で切断しました:${detachReason}`)
                });

                chrome.debugger.onEvent.addListener((debuggeeId, message, params)=>{
                    //今回はresponse限定
                    if(message == "Network.responseReceived"){
                        /*console.log(
                            [
                                debuggeeId,
                                message,
                                params
                            ]
                        );*/
                        chrome.debugger.sendCommand({
                            tabId: debuggeeId.tabId
                        },
                        //通信内容を読み取るメソッド
                        "Network.getResponseBody",
                        {
                            //引数にrequestIdが必要
                            "requestId": params.requestId
                        },
                        //responsebodyを返す
                        (response) => {
                            console.log([response,count]);
                        })
                    }
                })
            });
        }
    )
})