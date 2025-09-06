interface PatternImageDto {
  id: number; // 아이디
}

interface PatternImageDeleteReqDto {
  id: number; // 아이디
}

interface YarnNeedleImageDto {
  id: number; // 아이디
}

interface YarnNeedleImageDeleteReqDto {
  id: number; // 아이디
}

interface PictureDto {
  id: number; // 아이디
}

interface PictureDeleteReqDto {
  id: number; // 아이디
}

interface PatternFileDto {
  id: number; // 아이디
}

export type {
  PatternFileDto, PatternImageDeleteReqDto, PatternImageDto, PictureDeleteReqDto,
  PictureDto, YarnNeedleImageDeleteReqDto, YarnNeedleImageDto
};

