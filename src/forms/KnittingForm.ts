interface KnittingCreateForm {
  patternNameSize: string;              // 도안 이름과 크기
  designer: string;                     // 디자이너
  originYarn: string;                   // 원작 실
  originGauge: string;                  // 원작 게이지
  originNeedleSize: string;             // 원작 바늘 크기  
  originYardage: string;                // 원작 실 사용량
  patternImageFile: File|undefined;     // 도안 사진
  yarn: string;                         // 실
  needles: string;                      // 바늘
  gauge: string;                        // 게이지
  yardage: string;                      // 실 사용량
  yarnNeedleImageFile: File|undefined;  // 실/바늘 사진
  contents: string;                     // 내용
  patternFile: File|undefined;          // 도안 pdf 파일
  attachFiles: File[]|undefined;        // 사진 파일들
  startDate: string;                    // 시작일
  endDate: string|null;                 // 종료일
  selectedStartDate: Date;              // 시작일 달력
  selectedEndDate: Date|null;           // 종료일 달력
}

interface KnittingUpdateForm {
  id: number;                           // 아이디
  patternNameSize: string;              // 도안 이름과 크기
  designer: string;                     // 디자이너
  originYarn: string;                   // 원작 실
  originGauge: string;                  // 원작 게이지
  originNeedleSize: string;             // 원작 바늘 크기  
  originYardage: string;                // 원작 실 사용량
  patternImageFile: File|undefined;     // 도안 사진
  yarn: string;                         // 실
  needles: string;                      // 바늘
  gauge: string;                        // 게이지
  yardage: string;                      // 실 사용량
  yarnNeedleImageFile: File|undefined;  // 실/바늘 사진
  contents: string;                     // 내용
  patternFile: File|undefined;          // 도안 pdf 파일
  attachFiles: File[]|undefined;        // 사진 파일들
  startDate: string;                    // 시작일
  endDate: string|null;                 // 종료일
  selectedStartDate: Date;              // 시작일 달력
  selectedEndDate: Date|null;           // 종료일 달력
}

export type { KnittingCreateForm, KnittingUpdateForm };

