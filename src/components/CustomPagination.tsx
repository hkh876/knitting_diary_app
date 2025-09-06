import styles from "@/styles/CustomPagination.module.css";
import { Pagination, Stack } from "@mui/material";
import { ChangeEvent } from "react";

interface CustomPaginationProps {
  page: number;             // 현재 페이지
  totalPages: number;       // 총 페이지 수
  onPageChange: (event: ChangeEvent<unknown>, page: number) => void; // 페이지 변경 이벤트
}

const CustomPagination = ({ page, totalPages, onPageChange }: CustomPaginationProps) => {
  return (
    <>
      <Stack className={styles.paginationContainer}>
        <Pagination count={totalPages} page={page} onChange={onPageChange}/>
      </Stack>
    </>
  )
}

export default CustomPagination