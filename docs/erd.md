# ERD(Entity-RelationshipDiagram)
: 엔티티는 역할(책임)이다.
✅ 무엇을 저장하냐보다 "왜 따로 저장하냐"이다.

ERD는 “동작”이 아니라 “동작이 남긴 결과”를 그리는 것이다

시스템 안에서
고유한 식별자가 있고
상태를 저장해야 하며
다른 대상과 관계를 맺는 도메인 객체다.

ERD는 화면이 아닌 상태 기준으로 짜야한다.
1. 이 시스템에 로그인하는 주체는 누구인가?
2. 학생이 가입할 때 별도로 필요한 인증 수단이 있는가?
3. 시험은 무엇으로 구성되는가?
4. 시험은 그냥 존재하기만 하면 되나, 아니면 학생에게 배정되어야 하나?
5. 학생이 시험을 푸는 “진행 상태”를 저장해야 하나?
6. 점수는 그냥 계산식으로 끝나나, 아니면 별도 기준표가 필요한가?
----
1. ??? - 무엇을 저장하기 위해 필요
2. ??? - 무엇과 무엇의 관계를 저장하기 위해 필요
----
## 엔티티 후보

### 사람(로그인 및 회원가입) 관련 엔티티
1. users

### 문제 관련 엔티티
1. 여기서 말한 문제는 levelTest와 mockTest는 클라이언트쪽에서 제공되는 모의고사 pdf와 wordTest로 나눈다.
2. 그래서 levelTest 와 mockTest는 같게 보고 어느 시험유형으로 들어가는냐에 따라 나누기만 한다.
3. 현재 mvp는 wordTest는 안들어가서 일단 보류하겠다.
- 문제
 - 추가적으로 답변 들어온 내용:
  1. SAT와 동일하게 한 모의고사에 (Reading13/Writing14)[Module1] 
  2. [Reading15~16/ Writing 12~11] 문제 들어갑니다[Module2]
 - 그러니까 levelTest나 mockTest는
   Module1: Reading 문제갯수 13 / Writing 문제갯수 14
   Module2: Reading 문제갯수 15~16 / Writing 문제갯수 12~11
- 지문
 - Reading인 경우 단락이 여러개 일 수 있다
 - Writing인 경우
- 질문(지문에 질문이 한개 이상이 있을 수도 있다)
- 보기(선택지 4개)
- 타이머(mockTest levelTest다 모듈1,2이며 모듈별로 각각 32분)
4. 채점
- 정답
- 정답체크
- 타이머

### 시험 관련 엔티티
1. levelTest
2. mockTest
3. wordTest
4. 시험 배정
5. 시험 결과
6. 시험 제출
7. 시험 저장

### 관계 저장 관련 엔티티

### 시간이 지나며 변하는 상태 관련 엔티티
1. 시험 시작
2. 답안 저장
3. 제출 완료
----

## 엔티티 후보

1. users
- 학생, 관리자, 슈퍼관리자 계정 정보를 저장하기 위한 엔티티
- role, admin_type으로 권한을 구분한다

2. signup_codes
- 학생 회원가입 시 필요한 가입 코드를 저장하기 위한 엔티티

3. source_files
- 문제 등록 시 참고하는 PDF 원본 파일 정보를 저장하기 위한 엔티티
- 추후 숙제 제출 파일까지 확장 가능하다

4. exams
- Level Test / Mock Test / Word Test 같은 시험 세트와 시험 정책을 저장하기 위한 엔티티

5. questions
- 시험에 사용되는 문제, 지문, 보기, 정답, 유형 정보를 저장하기 위한 엔티티

6. exam_questions
- 시험과 문제의 연결 관계 및 문제 순서/모듈 정보를 저장하기 위한 엔티티

7. exam_assignments
- 특정 시험을 특정 학생에게 배정한 기록을 저장하기 위한 엔티티

8. submissions
- 학생의 시험 응시 1회 기록과 진행 상태, 제출 상태, 점수 정보를 저장하기 위한 엔티티

9. submission_answers
- 응시 중 문제별 답안 저장 및 채점을 위해 필요한 엔티티

10. score_tables
- raw score를 scaled score로 환산하기 위한 기준표를 저장하는 엔티티

----
### 후보 엔티티

- Core
1. users
2. exams
3. questions
4. signup_codes
5. source_files
- Relation
6. 시험-문제: exam_question
7. 시험-배정: exam_assignments
- Event
8. 시험 제출: submissions
9. 제출한 시험 정답: submmsion_answers
- Derived
10. score_tables

====

users
- id PK
- 