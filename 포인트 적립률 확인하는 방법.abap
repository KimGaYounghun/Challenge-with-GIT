REPORT ZCL1R04009_03.
DATA: lv_grade TYPE string,   "고객 등급을 저장할 변수
      lv_amount TYPE p DECIMALS 2,   "구매 금액을 저장할 변수
      lv_rate TYPE p DECIMALS 2,     "적립률을 저장할 변수
      lv_points TYPE p DECIMALS 2.   "포인트를 저장할 변수

Write:/ '고객 등급 입력 (GOLD. Silver, BRONZE) : '.
Read line lv_grade.
write: /'구매 금액 입력: '.
read line lv_amount.

IF lv_amount < 0.
  write:/ '구매 금액은 0 이상이어야합니다.'.
  exit.

ENDIF.

CASE lv_grade.
  When 'GOLD'.
    lv_rate = 5.
  When 'Silver'.
    lv_rate = 3.
  When 'BRONZE'.
    lv_rate = 1.
  When OTHERS.
    lv_rate = 0.
 ENDCASE.

 lv_points = lv_amount * lv_rate / 100.

 WRITE: / '고객 등급: ', lv_grade,
       / '포인트 적립률: ', lv_rate, '%',
       / '총 적립 포인트: ', lv_points.