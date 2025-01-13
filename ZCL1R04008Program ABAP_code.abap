*&---------------------------------------------------------------------*
*& Report ZCL1R04008
*&---------------------------------------------------------------------*
*&
*&---------------------------------------------------------------------*
REPORT zcl1r04008.


**********************************************************************
* Internal Table and Work Area_조인 먼저
**********************************************************************
DATA : BEGIN OF gs_schedule,
         carrid   TYPE scarr-carrid,
         connid   TYPE spfli-connid,
         cityfrom TYPE spfli-cityfrom,
         cityto   TYPE spfli-cityto,
         carrname TYPE scarr-carrname,
       END OF gs_schedule,
       gt_schedule LIKE TABLE OF gs_schedule.

DATA : BEGIN OF gs_flight,
         carrid   TYPE spfli-carrid,
         connid   TYPE spfli-connid,
         fldate   TYPE sflight-fldate,
         airpfrom TYPE spfli-airpfrom,
         airpto   TYPE spfli-airpto,
         seatsmax TYPE sflight-seatsmax,
         seatsocc TYPE sflight-seatsocc,
       END OF gs_flight,
       gt_flight LIKE TABLE OF gs_flight.
**********************************************************************
"SPFLI와 SFLIGHT를 inner Join하여 위의 Internal Table에 Data를 적재
**********************************************************************
CLEAR: gs_flight , gt_flight.
SELECT a~carrid a~connid b~fldate a~airpfrom a~airpto b~seatsmax b~seatsocc "fldate airpfrom airpto seatsmax seatsocc
  INTO CORRESPONDING FIELDS OF TABLE gt_flight
  FROM spfli AS a INNER JOIN sflight AS b
  ON a~carrid = b~carrid AND a~connid = b~connid
  WHERE b~connid BETWEEN '0400' AND '0500' AND fldate = '20240709'
  ORDER BY b~connid ASCENDING.
"cl_demo_output=>display( gt_flight ).

**********************************************************************
"GET DATA - Join SQL
**********************************************************************

CLEAR : gs_schedule, gt_schedule.
SELECT a~carrid b~connid b~cityfrom b~cityto a~carrname "a~carrid connid cityfrom cityto carrname -> 소속이 명확한 친구는 괜찮긴함.
  INTO CORRESPONDING FIELDS OF TABLE gt_schedule
  FROM scarr AS a INNER JOIN spfli AS b
  ON a~carrid = b~carrid  "어떠한 조인 관계를 맺을 지
  WHERE b~connid BETWEEN '0400' AND '0800' "여기서도 'b~'도 지워도 된다는 것. 하지만 같은 필드면 반드시 구분해서 작성해야 한다.
  ORDER BY a~carrid.


**********************************************************************
**********************************************************************
*OUTER JOIN : Scarr와 Spfli를 Left join 하여 internal Table 적재
**********************************************************************
**********************************************************************
SELECT a~carrid b~connid b~cityfrom b~cityto a~carrname
  INTO CORRESPONDING FIELDS OF TABLE gt_schedule
  FROM scarr AS a LEFT OUTER JOIN spfli AS b
  ON a~carrid = b~carrid
  WHERE a~carrid BETWEEN 'AA' AND 'ZZ'.
"cl_demo_output=>display( gt_schedule ).

DATA : BEGIN OF gs_airline,
         carrid   TYPE scarr-carrid,
         connid   TYPE spfli-connid,
         cityfrom TYPE spfli-cityfrom,
         cityto   TYPE spfli-cityto,
         seatsmax TYPE sflight-seatsmax,
         seatsocc TYPE sflight-seatsocc,
         carrname TYPE scarr-carrname,
       END OF gs_airline,
       gt_airline LIKE TABLE OF gs_airline.
CLEAR : gs_airline, gt_airline.
SELECT a~carrid b~connid b~cityfrom b~cityto c~seatsmax c~seatsocc a~carrname
INTO CORRESPONDING FIELDS OF TABLE gt_airline
FROM scarr AS a INNER JOIN spfli AS b
ON a~carrid = b~carrid
INNER JOIN sflight AS c
"ON a~carrid = c~carrid
  ON b~carrid = c~carrid
  AND b~connid = c~connid
WHERE b~connid BETWEEN '0400' AND '0800'.
"cl_demo_output=>display( gt_airline ).

DATA: BEGIN OF gs_booking,
        carrid   TYPE spfli-carrid,
        connid   TYPE spfli-connid,
        fldate   TYPE sflight-fldate,
        bookid   TYPE sbook-bookid,
        cityfrom TYPE spfli-cityfrom,
        cityto   TYPE spfli-cityto,
        seatsmax TYPE sflight-seatsmax,
        seatsocc TYPE sflight-seatsocc,
        custtype TYPE sbook-custtype,
        smoker   TYPE sbook-smoker,
      END OF gs_booking,
      gt_booking LIKE TABLE OF gs_booking.
**********************************************************************
SELECT a~carrid a~connid b~fldate c~bookid a~cityfrom a~cityto
  b~seatsmax b~seatsocc c~custtype c~smoker
  INTO CORRESPONDING FIELDS OF TABLE gt_booking
  FROM spfli AS a INNER JOIN sflight AS b
  ON a~carrid = b~carrid
  AND a~connid = b~connid
  INNER JOIN sbook AS c
  ON b~carrid = c~carrid
  AND b~connid = c~connid
  AND b~fldate = c~fldate
  WHERE a~connid BETWEEN '0400' AND '0400' AND c~smoker = 'X'
  AND b~fldate = '20240714'
  ORDER BY bookid ASCENDING.
*cl_demo_output=>display( gt_booking ).
**********************************************************************
**********************************************************************
*DATA : BEGIN OF gs_test_13,
*         matnr TYPE mara-matnr,
*         werks TYPE marc-werks,
*         ersda TYPE mara-ersda,
*         mtart TYPE mara-mtart,
*         pstat TYPE marc-pstat,
*       END OF gs_test_13.
*DATA: gt_test_13 LIKE TABLE OF gs_test_13.
*
*Select a~matnr b~werks a~ersda a~mtart b~pstat
*  into CORRESPONDING FIELDS OF table gt_test_13
*  from mara as A INNER JOIN marc as b
*  on a~matnr = b~matnr.
*  cl_demo_output=>display( gt_test_13 ).

DATA: BEGIN OF gs_test_13,
        index TYPE sy-tabix, " 추가된 인덱스 필드
        matnr TYPE mara-matnr,
        werks TYPE marc-werks,
        ersda TYPE mara-ersda,
        mtart TYPE mara-mtart,
        pstat TYPE marc-pstat,
      END OF gs_test_13.

DATA: gt_test_13 LIKE TABLE OF gs_test_13.
data: numbering TYPE i.

" 데이터 SELECT
SELECT a~matnr b~werks a~ersda a~mtart b~pstat
  INTO CORRESPONDING FIELDS OF TABLE gt_test_13
  FROM mara AS a
  INNER JOIN marc AS b
  ON a~matnr = b~matnr.

" sy-tabix를 활용해 인덱스 번호 추가
LOOP AT gt_test_13 INTO gs_test_13.
  gs_test_13-index = sy-tabix.
  MODIFY gt_test_13 FROM gs_test_13 INDEX sy-tabix.
ENDLOOP.

DESCRIBE TABLE gt_test_13 lines numbering.

" 결과 출력
"cl_demo_output=>write( |출력된 행 수: { numbering }| ).
"cl_demo_output=>display( gt_test_13 ).
**********************************************************************

DATA: BEGIN OF gs_test_14,
        index TYPE sy-tabix, " 추가된 인덱스 필드
        matnr TYPE mara-matnr,
        werks TYPE marc-werks,
        ersda TYPE mara-ersda,
        mtart TYPE mara-mtart,
        pstat TYPE marc-pstat,
      END OF gs_test_14.

DATA: gt_test_14 LIKE TABLE OF gs_test_14,
      lv_count TYPE i. " 테이블 행 수를 저장할 변수

" 데이터 SELECT
SELECT a~matnr, b~werks, a~ersda, a~mtart, b~pstat
  INTO CORRESPONDING FIELDS OF TABLE @gt_test_14
  FROM mara AS a
  INNER JOIN marc AS b
  ON a~matnr = b~matnr.

" sy-tabix를 활용해 인덱스 번호 추가
LOOP AT gt_test_14 INTO gs_test_14.
  gs_test_14-index = sy-tabix.
  MODIFY gt_test_14 FROM gs_test_14 INDEX sy-tabix.
ENDLOOP.

" 테이블의 행 수 계산
DESCRIBE TABLE gt_test_14 LINES lv_count.

" 결과 출력 
*cl_demo_output=>write( |출력된 행 수: { lv_count }| ). " 행 수를 표시
*cl_demo_output=>display( gt_test_14 ).