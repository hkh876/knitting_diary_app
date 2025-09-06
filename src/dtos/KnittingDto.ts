import { PatternFileDto, PatternImageDto, PictureDto, YarnNeedleImageDto } from "./PictureDto";

interface KnittingListResDto {
  id: number;               // 아이디
  patternNameSize: string;  // 도안 이름과 크기
  yarn: string;             // 실
  needles: string;          // 바늘
  startDate: string;        // 시작일
  endDate: string;          // 종료일
}

interface KnittingInfoResDto {
  id: number;                           // 아이디
  patternNameSize: string;              // 도안 이름과 크기
  designer: string;                     // 디자이너
  originYarn: string;                   // 원작 실
  originGauge: string;                  // 원작 게이지
  originNeedleSize: string;             // 원작 바늘 크기  
  originYardage: string;                // 원작 실 사용량
  yarn: string;                         // 실
  needles: string;                      // 바늘
  gauge: string;                        // 게이지
  yardage: string;                      // 실 사용량
  contents: string;                     // 내용
  startDate: string;                    // 시작일
  endDate: string|null;                 // 종료일
  patternImage: PatternImageDto;        // 도안 사진
  yarnNeedleImage: YarnNeedleImageDto;  // 실/바늘 사진
  pictures: PictureDto[];               // 사진 목록 
  patternFile: PatternFileDto;          // 도안 pdf 파일
}

interface KnittingDeleteReqDto {
  id: number; // 아이디
}

export type { KnittingDeleteReqDto, KnittingInfoResDto, KnittingListResDto };

