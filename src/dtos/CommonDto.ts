class EmptyDto {}

class PaginationExDto<T> {
  readonly contents: T[] = [];        // 데이터 목록
  readonly totalElements: number = 0; // 전체 데이터 수
  readonly totalPages: number = 0;    // 전체 페이지 수
  readonly page: number = 1;          // 현제 페이지
  readonly size: number = 10;         // 페이지 크기
  readonly first: boolean = true;     // 첫 번째 페이지 여부
  readonly last: boolean = true;      // 마지막 페이지 여부
}

interface PageDto {
  page: number; // 페이지 번호
  size: number; // 페이지 크기
}

export type { EmptyDto, PageDto, PaginationExDto };
