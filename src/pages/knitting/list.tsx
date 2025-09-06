import CustomPagination from "@/components/CustomPagination"
import Loading from "@/components/Loading"
import { PageDto, PaginationExDto } from "@/dtos/CommonDto"
import { KnittingListResDto } from "@/dtos/KnittingDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { useGetQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/knitting/List.module.css"
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { ChangeEvent, useEffect, useState } from "react"

interface ListProps {
  page: number; // 페이지 번호
  size: number; // 페이지 크기
}

const List = ({ page, size }: ListProps) => {
  // router
  const router = useRouter()

  // states
  const [params, setParams] = useState<PageDto>({
    page: page,
    size: size
  }) 

  // query
  const { data, isLoading } = useGetQueryEx<PaginationExDto<KnittingListResDto>>({
    queryKey: QueryKeyEnum.READ_KNITTING_LIST,
    url: "/api/v1/knitting/list",
    params: params
  })

  // events
  const onCreateClick = () => {
    router.push({ pathname: "/knitting/create" })
  }

  const onPageChange = (_: ChangeEvent<unknown>, page: number) => {
    router.push({ query: { ...router.query, page: page } })
  }

  const onProjectClick = (id: number) => {
    router.push({ pathname: "/knitting/update", query: { id: id } })
  }

  // values
  const title = `My Knitting\nDiary`

  useEffect(() => {
    setParams((prevState) => ({
      ...prevState,
      page: page
    }))
  }, [page])

  return (
    <>
      <Box className={styles.homeContainer}>
        <Typography className={styles.titleText}>{title}</Typography>
        <Box className={styles.actionContainer}>
          <Button variant={"contained"} onClick={onCreateClick}>프로젝트 추가</Button>
          <Button variant={"contained"} color={"secondary"} className={styles.yarnInfoButton}>실정보</Button>
        </Box>
        <TableContainer className={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>번호</TableCell>
                <TableCell>프로젝트</TableCell>
                <TableCell>사용실</TableCell>
                <TableCell>바늘호수</TableCell>
                <TableCell>시작일</TableCell>
                <TableCell>종료일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { isLoading ? <></> : data && data.contents.length > 0 ? (
                data.contents.map((knitting, index) => (
                  <TableRow key={knitting.id}>
                    <TableCell>{(data.page - 1) * data.size + index + 1}</TableCell>
                    <TableCell className={styles.projectCell} onClick={() => onProjectClick(knitting.id)}>{knitting.patternNameSize}</TableCell>
                    <TableCell>{knitting.yarn}</TableCell>
                    <TableCell>{knitting.needles}</TableCell>
                    <TableCell>{knitting.startDate}</TableCell>
                    <TableCell>{knitting.endDate}</TableCell>
                  </TableRow>    
                ))    
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>데이터가 존재 하지 않습니다.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        { data && data.contents.length > 0 && 
          <CustomPagination page={data.page} totalPages={data.totalPages} onPageChange={onPageChange}/>
        }
      </Box>
      <Loading open={isLoading} />
    </>
  )
}

export const getServerSideProps = async ({ query }: { query: { page?: string, size?: string } }) => {
  const page = query.page ? parseInt(query.page) : 1
  const size = query.size ? parseInt(query.size) : 20

  return { props: { page, size } }
}
export default List