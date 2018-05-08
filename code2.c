#include <SoftwareSerial.h>
#include <Wire.h>

SoftwareSerial BT(2, 3) ; //設置硬體藍芽腳位

int k = 0, stopto = 0 , n = 2, isUnlock = 0,getBTDataNum = 0 ,tryUnchaosNum = 0;
float chaosKey, y1[4], y2[4], y3[4], u1, u2, ax1, ax2, ax3, dx1, dx2, dx3, g1, g2, g3, g4, h1, h2, j1, j2, c1 = -0.5, c2 = 0.06, A = 0.1, 
      USBKey1 = -12345, USBKey2 = -543.21, USBKey3 = 21.354;//系統預設金鑰
byte str[8];// 接收手機端的資料空間
struct IEEE754float //切割float數值成IEEE754資料格式

{
    uint8_t D:8;  //共32位元 切割4組；每組8位元
    uint8_t C:8;
    uint8_t B:8;
    uint8_t A:8;
};

void setup()
{
  Serial.begin(9600);
  BT.begin(9600);

  //記憶體空間索引陣列的初始值
  k = 0; 

  //系統預設的亂數初始值
  y1[0] = -0.3;
  y2[0] = -0.1;
  y3[0] = 0.8;

  //系統預設可調變參數，可透過調整增加其混沌破解困難
  ax1=1;
  ax2=1;
  ax3=1;
  dx1=1;
  dx2=1;
  dx3=1;

}



void loop(){

 if (BT.available()) {

    switch (getBTDataNum) {// 重複捕捉手機端傳送的IEEE754，因透過藍芽傳輸，限制8個位元為上限，因此接收4次為一組浮點數值

      case 0:
        str[0] = (byte) BT.read();
        getBTDataNum++;    // 透過此變數由 0 至 3 個別接收
        break;
      case 1:
        str[1] = (byte) BT.read();
        getBTDataNum++;
        break;
      case 2:
        str[2] = (byte) BT.read();
        getBTDataNum++;
        break;
      case 3:
        str[3] = (byte) BT.read();
        getBTDataNum++;
        getU1(str[0],str[1],str[2],str[3]); //將4個各別接收的值重組，返回原手機傳送的同步控制器參數
        break;
      case 4:
        str[4] = (byte) BT.read();
        getBTDataNum++;// 透過此變數由 4 至 7 個別接收
        break;
      case 5:
        str[5] = (byte) BT.read();
        getBTDataNum++;
        break;
      case 6:
        str[6] = (byte) BT.read();
        getBTDataNum++;
        break;
      case 7:
        str[7] = (byte) BT.read();
        getBTDataNum = 0;
        getChaoskey(str[4],str[5],str[6],str[7]); //將4個各別接收的值重組，返回原手機傳送的加密金鑰
        startToUnlock(u1,chaosKey); //接收數值後開始執行解密的混沌運算，並傳入同步控制器參數與加密金鑰
        break;

    }

  }

}



void startToUnlock(float Us,float chaosKey){    //混沌解密運算 

  choasMath(Us);//呼叫公式進行運算並傳入同步控制器參數

  //展示用途，於Serial port 顯示出當前狀態
  Serial.print("chaosKey = ");
  Serial.print(chaosKey, 7);
  Serial.print("\t\ty1(");
  Serial.print(k+1);
  Serial.print(") = ");
  Serial.print(y1[k+1], 7);
  Serial.print("\t\t");
  Serial.print(stopto);
  Serial.println("");
  stopto++;
  //----------

  k++;

  switch (tryUnchaosNum) {

    case 0:

    //比對本地金鑰 1 與手機端金鑰 1 ，如果比對失敗則，調整記憶體空間，使消耗的記憶體空間縮小並且清除運算過程的紀錄
      if(comparisonPassKey1(chaosKey)){
        if(k > 2){
          k = 0;
          y1[0] = y1[3];
          y2[0] = y2[3];
          y3[0] = y3[3];
        }
      }
      tryUnchaosNum++;
      break;
    case 1:

    //比對本地金鑰 2 與手機端金鑰 2 ，如果比對失敗則，調整記憶體空間，使消耗的記憶體空間縮小並且清除運算過程的紀錄
      if(comparisonPassKey2(chaosKey)){
        if(k > 2){
          k = 0;
          y1[0] = y1[3];
          y2[0] = y2[3];
          y3[0] = y3[3];
        }  
      }
      tryUnchaosNum++;
      break;
    case 2:

    //比對本地金鑰 3 與手機端金鑰 3 ，如果比對失敗則，調整記憶體空間，使消耗的記憶體空間縮小並且清除運算過程的紀錄
      if(comparisonPassKey3(chaosKey)){
        if(k > 2){
          k = 0;
          y1[0] = y1[3];
          y2[0] = y2[3];
          y3[0] = y3[3];
        }
      }
      tryUnchaosNum=0;
      break;
      
    }

}



void choasMath(float Us){//混沌運算公式

  g1 = - ( ax1 / (ax2 * ax2) );

  g2 = 2 * ax1 * dx2 / (ax2 * ax2);

  g3 = - 0.1 * ax1 / ax3;

  g4 = ax1 * ( 1.76 - (dx2 * dx2) /  (ax2 * ax2) + 0.1 * ax1 * dx3 / ax3 ) + dx1;



  h1 = ax2 / ax1;

  h2 = - ( ax2 * dx1 ) / ax1 + dx2;

   

  j1 = ax3 / ax2;

  j2 = - ( ax3 * dx2 )/ ax2 + dx3;



  u2 = -(y2[k] * y2[k]) * g1 - y2[k] * g2 - y3[k] * g3 - y1[k] * c1 * h1 - y2[k] * c2 * j1 + y1[k] * A + y2[k] * c1 * A + y3[k] * c2 * A;



  y1[k+1]= g1 * y2[k] * y2[k] + g2 * y2[k] + g3 * y3[k] + g4 + Us + u2 ;//

  y2[k+1]= h1 * y1[k] + h2;

  y3[k+1]= j1 * y2[k] + j2;

}

void getU1(byte u1Value1,byte u1Value2,byte u1Value3,byte u1Value4){//取得IEEE754格式的U1 同步控制器參數數值

  float u;

    ((byte*)&u)[3]= u1Value1;//透過記憶體位址設定，返回原傳輸數值

    ((byte*)&u)[2]= u1Value2;

    ((byte*)&u)[1]= u1Value3;

    ((byte*)&u)[0]= u1Value4;

    u1 = u;

}

void getChaoskey(byte chaosKeyValue1,byte chaosKeyValue2,byte chaosKeyValue3,byte chaosKeyValue4){//取得IEEE754格式的混沌加密USB金鑰數值

  float chaosValue;

    ((byte*)&chaosValue)[3]= chaosKeyValue1;//透過記憶體位址設定，返回原傳輸數值

    ((byte*)&chaosValue)[2]= chaosKeyValue2;

    ((byte*)&chaosValue)[1]= chaosKeyValue3;

    ((byte*)&chaosValue)[0]= chaosKeyValue4;

    chaosKey = chaosValue;

}



boolean comparisonPassKey1(float chaosPassKey){//比對混沌加密後傳輸的USB金鑰與本地金鑰 1

  float unChaos = chaosPassKey / ( 1 + ( y1[k] * y1[k] )); //解密金鑰 1

  float mistake = USBKey1 - unChaos;//將解密後的金鑰 1 與本地金鑰 1 比對

  if(mistake <= 0.00001 && mistake >= -0.00001){//透過預設經度判斷金鑰是否正確

    Serial.println("KEY1解鎖成功"); //展示用途，於Serial port 顯示出

    BT.print("B");//告知手機金鑰 1 已比對完成

    sendIEEE754float(unChaos);  //展示用途，將解密後的金鑰值傳至手機

    return(false);

  }else{

    BT.print("A");//告知手機金鑰 1 已比對失敗

    sendIEEE754float(unChaos);  //展示用途，將解密後的金鑰值傳至手機

    return(true);

  }

}



boolean comparisonPassKey2(float chaosPassKey){//比對混沌加密後傳輸的USB金鑰與本地金鑰 2

  float unChaos = chaosPassKey / ( 1 + ( y1[k] * y1[k] )) ; //解密金鑰 2

  float mistake = USBKey2 - unChaos;//將解密後的金鑰 2 與本地金鑰 2 比對

  if(mistake <= 0.00001 && mistake >= -0.00001){//透過預設經度判斷金鑰是否正確

    Serial.println("KEY2解鎖成功"); //展示用途，於Serial port 顯示出

    BT.print("C");//告知手機金鑰 2 已比對完成

    sendIEEE754float(unChaos);  //展示用途，將解密後的金鑰值傳至手機

    return(false);

  }else{

    BT.print("A");//告知手機金鑰 2 已比對失敗

    sendIEEE754float(unChaos);  //展示用途，將解密後的金鑰值傳至手機

    return(true);

  }

}

boolean comparisonPassKey3(float chaosPassKey){//比對混沌加密後傳輸的USB金鑰與本地金鑰 3

  float unChaos = chaosPassKey / ( 1 + ( y1[k] * y1[k] )) ; //解密金鑰 3

  float mistake = USBKey3 - unChaos;//將解密後的金鑰 3 與本地金鑰 3 比對

  if(mistake <= 0.00001 && mistake >= -0.00001){//透過預設經度判斷金鑰是否正確

    Serial.println("KEY3解鎖成功"); //展示用途，於Serial port 顯示出

    BT.print("D");//告知手機金鑰 3 已比對完成

    sendIEEE754float(unChaos);  //展示用途，將解密後的金鑰值傳至手機

    return(false);

  }else{

    BT.print("A");//告知手機金鑰 3 已比對失敗

    sendIEEE754float(unChaos);  //展示用途，將解密後的金鑰值傳至手機

    return(true);

  }

}

void sendIEEE754float(float number){

  //透過藍芽傳輸切割後的IEEE754資料格式

  IEEE754float* x = (IEEE754float*) ((void*)&number);

  //因硬體限制共傳輸4次為一組

    BT.print(x->D);

    BT.print(x->C);

    BT.print(x->B);

    BT.print(x->A);

}