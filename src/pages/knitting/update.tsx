import CustomDatePicker from "@/components/CustomDatePicker";
import ExternalImage from "@/components/ExternalImage";
import FileProgressing from "@/components/FileProgressing";
import Loading from "@/components/Loading";
import { EmptyDto } from "@/dtos/CommonDto";
import { KnittingDeleteReqDto, KnittingInfoResDto } from "@/dtos/KnittingDto";
import { PatternImageDeleteReqDto, PictureDeleteReqDto, YarnNeedleImageDeleteReqDto } from "@/dtos/PictureDto";
import { QueryKeyEnum } from "@/enums/QueryKeyEnum";
import { ErrorCode } from "@/errors/ErrorCode";
import { KnittingUpdateForm } from "@/forms/KnittingForm";
import { ErrorRes, useDeleteQueryEx, useGetQueryEx, usePutQueryEx } from "@/queries/useQueryEx";
import styles from "@/styles/knitting/Update.module.css";
import { isValidDate, isValidDateString } from "@/utils/Utils";
import { Box, Button, Grid, InputBase, TextField, Typography } from "@mui/material";
import { AxiosProgressEvent } from "axios";
import classNames from "classnames";
import { format, parse } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import Slider from "react-slick";
import { toast, ToastContainer } from "react-toastify";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { LongPressCallbackMeta, LongPressReactEvents, useLongPress } from "use-long-press";

interface UpdateProps {
  id: number; // 아이디
}

const Update = ({ id }: UpdateProps) => {
  // router
  const router = useRouter()

  // states
  const [isConnectMobile, setIsConnectMobile] = useState(false)
  const [patternPreview, setPatternPreview] = useState<string>("")
  const [yarnNeedlePreview, setYarnNeedlePreview] = useState<string>("")
  const [fileUploadEnabled, setFileUploadEnabled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressOpen, setProgressOpen] = useState(false)
  const [patternImageId, setPatternImageId] = useState(0)
  const [yarnNeedleImageId, setYarnNeedleImageId] = useState(0)
  const [pictureId, setPictureId] = useState(0)

  // query
  const onResSuccess = () => {
    toast.success(
      "수정 되었습니다.",
      { onClose: () => router.reload(), autoClose: 1000 }
    )

    setProgressOpen(false)
  }

  const onResError = useCallback((error: ErrorRes) => {
    if (error.errorCode === ErrorCode.UPLOAD_SIZE_ERROR) {
      toast.error(error.message, { autoClose: 2000 })
    } else if (error.errorCode === ErrorCode.NOT_VALID_ERROR) {
      toast.error(error.message, { autoClose: 2000 })
    } else {
      console.error("Not implement : ", error.errorCode)
    }

    setProgressOpen(false)
  }, [])

  const onProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setProgress(percent)
    }
  }

  const onImageDeleteResSuccess = () => {
    toast.success(
      "삭제 되었습니다.",
      { onClose: () => router.reload(), autoClose: 1000 }
    )
  }

  const onDeleteResSuccess = () => {
    toast.success(
      "삭제 되었습니다.",
      { onClose: () => router.back(), autoClose: 1000 }
    )
  }

  const { data, isLoading: readIsLoading } = useGetQueryEx<KnittingInfoResDto>({
    queryKey: QueryKeyEnum.READ_KNITTING_INFO,
    url: "/api/v1/knitting/info",
    params: {
      id: id.toString()
    },
  })

  const { mutate: updateMutate, isLoading: updateIsLoading } = usePutQueryEx<KnittingUpdateForm, EmptyDto>({
    url: "/api/v1/knitting/update",
    contentType: "multipart/form-data",
    onSuccess: onResSuccess,
    onError: onResError,
    onProgress: onProgress
  })

  const { mutate: deletePatternImage, isLoading: deletePatternImageIsLoading } = useDeleteQueryEx<PatternImageDeleteReqDto, EmptyDto>({
    url: "/api/v1/knitting/pattern/delete",
    onSuccess: onImageDeleteResSuccess
  })

  const { mutate: deleteYarnNeedleImage, isLoading: deleteYarnNeedleImageIsLoading } = useDeleteQueryEx<YarnNeedleImageDeleteReqDto, EmptyDto>({
    url: "/api/v1/knitting/yarn_needle/delete",
    onSuccess: onImageDeleteResSuccess
  })

  const { mutate: deletePicture, isLoading: deletePictureIsLoading } = useDeleteQueryEx<PictureDeleteReqDto, EmptyDto>({
    url: "/api/v1/knitting/picture/delete",
    onSuccess: onImageDeleteResSuccess
  })

  const { mutate: deleteMutate, isLoading: deleteIsLoading } = useDeleteQueryEx<KnittingDeleteReqDto, EmptyDto>({
    url: "/api/v1/knitting/delete",
    onSuccess: onDeleteResSuccess
  })

  // forms
  const { control, handleSubmit, setValue, reset, watch } = useForm<KnittingUpdateForm>({
    defaultValues: {
      id: id,
      patternNameSize: "",
      designer: "",
      originYarn: "",
      originGauge: "",
      originNeedleSize: "",
      originYardage: "",
      yarn: "",
      needles: "",
      gauge: "",
      yardage: "",
      contents: "",
      patternImageFile: undefined,
      yarnNeedleImageFile: undefined,
      patternFile: undefined,
      attachFiles: undefined,
      startDate: "",
      endDate: null,
      selectedStartDate: new Date(),
      selectedEndDate: null
    }
  })

  const onUpdateSubmit: SubmitHandler<KnittingUpdateForm> = (formData) => {
    if (confirm("수정 하시겠습니까?")) {
      if (formData.patternImageFile || formData.yarnNeedleImageFile || formData.patternFile 
        || (formData.attachFiles && formData.attachFiles.length > 0)) {
          setFileUploadEnabled(true)
          setProgressOpen(true)
      } else {
        setFileUploadEnabled(false)
        setProgressOpen(false)
      }
      
      updateMutate(formData)
    }
  }

  const onUpdateError: SubmitErrorHandler<KnittingUpdateForm> = (errors) => {
    if (errors.patternNameSize) {
      toast.error(errors.patternNameSize.message, { autoClose: 2000 })
    } else if (errors.designer) {
      toast.error(errors.designer.message, { autoClose: 2000 })
    } else if (errors.originYarn) {
      toast.error(errors.originYarn.message, { autoClose: 2000 })
    } else if (errors.originGauge) {
      toast.error(errors.originGauge.message, { autoClose: 2000 })
    } else if (errors.originNeedleSize) {
      toast.error(errors.originNeedleSize.message, { autoClose: 2000 })
    } else if (errors.originYardage) {
      toast.error(errors.originYardage.message, { autoClose: 2000 })
    } else if (errors.yarn) {
      toast.error(errors.yarn.message, { autoClose: 2000 })
    } else if (errors.needles) {
      toast.error(errors.needles.message, { autoClose: 2000 })
    } else if (errors.gauge) {
      toast.error(errors.gauge.message, { autoClose: 2000 })
    } else if (errors.yardage) {
      toast.error(errors.yardage.message, { autoClose: 2000 })
    }
  }

  // events
  const onPatternImageChange = async (event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement
    if (target.files?.length === 1) {
      const file = target.files[0]
      setValue("patternImageFile", file)

      // preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPatternPreview(reader.result as string)
      }
      reader.readAsDataURL(file)      
    } else {
      setPatternPreview("")
    }
  }

  const onYarnNeedleImageChange = async (event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement
    if (target.files?.length === 1) {
      const file = target.files[0]
      setValue("yarnNeedleImageFile", file)

      // preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setYarnNeedlePreview(reader.result as string)
      }
      reader.readAsDataURL(file) 
    } else {
      setYarnNeedlePreview("")
    }
  }

  const onPatternPdfChange = async (event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement
    if (target.files?.length === 1) {
      setValue("patternFile", target.files[0])
    }
  }

  const onContentsImageChange = async (event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement
    const fileArray = Array.from(target.files || [])

    setValue("attachFiles", fileArray)
  }

  const onDeleteClick = () => {
    if (confirm("데이터를 삭제 하시겠습니까?")) {
      deleteMutate({ id: id })
    }
  }

  const onCancelClick = () => {
    router.back()
  }

  const onPatternImageLongClick = useLongPress(() => {
    if (patternImageId) {
      if (confirm("도안 사진을 삭제 하시겠습니까?")) {
        deletePatternImage({id : patternImageId})
      }
    }
  }, {
    onStart: (_: LongPressReactEvents<Element>, meta: LongPressCallbackMeta<unknown>) => setPatternImageId(meta.context as number),
    threshold: 500,
    captureEvent: true
  })

  const onYarnNeedleImageLongClick = useLongPress(() => {
    if (yarnNeedleImageId) {
      if (confirm("실/바늘 사진을 삭제 하시겠습니까?")) {
        deleteYarnNeedleImage({id : yarnNeedleImageId})
      }
    }
  }, {
    onStart: (_: LongPressReactEvents<Element>, meta: LongPressCallbackMeta<unknown>) => setYarnNeedleImageId(meta.context as number),
    threshold: 500,
    captureEvent: true
  })

  const onPictureLongClick = useLongPress(() => {
    if (pictureId) {
      if (confirm("사진을 삭제 하시겠습니까?")) {
        deletePicture({id : pictureId})
      }
    }
  }, {
    onStart: (_: LongPressReactEvents<Element>, meta: LongPressCallbackMeta<unknown>) => setPictureId(meta.context as number),
    threshold: 500,
    captureEvent: true
  })

  // values
  const watchedSelectedStartDate = watch("selectedStartDate")
  const watchedSelectedEndDate = watch("selectedEndDate")
  const patternImageUrl = data?.patternImage ? `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/v1/knitting/pattern/preview?id=${data.patternImage.id}` : ''
  const yarnNeedleImageUrl = data?.yarnNeedleImage ? `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/v1/knitting/yarn_needle/preview?id=${data.yarnNeedleImage.id}` : ''

  useEffect(() => {
    setIsConnectMobile(isMobile)
  }, [])

  useEffect(() => {
    if (data) {
      reset({
        id: data.id,
        patternNameSize: data.patternNameSize,
        designer: data.designer,
        originYarn: data.originYarn,
        originGauge: data.originGauge,
        originNeedleSize: data.originNeedleSize,
        originYardage: data.originYardage,
        yarn: data.yarn,
        needles: data.needles,
        gauge: data.gauge,
        yardage: data.yardage,
        contents: data.contents,
        endDate: data.endDate
      })

      if (isValidDateString(data.startDate)) {
        setValue("startDate", data.startDate)
        setValue("selectedStartDate", parse(data.startDate, "yyyy-MM-dd", new Date()))
      }

      if (data.endDate && isValidDateString(data.endDate)) {
        setValue("endDate", data.endDate)
        setValue("selectedEndDate", parse(data.endDate, "yyyy-MM-dd", new Date()))
      }
    }
  }, [data, reset, setValue])

  useEffect(() => {
    setValue("startDate", format(watchedSelectedStartDate, "yyyy-MM-dd"))
    if (watchedSelectedEndDate && isValidDate(watchedSelectedEndDate)) {
      setValue("endDate", format(watchedSelectedEndDate, "yyyy-MM-dd"))
    } else {
      setValue("endDate", null)
    }
  }, [watchedSelectedStartDate, watchedSelectedEndDate, setValue])

  return (
    <>
      <Box className={styles.projectUpdateContainer}>
        <Box className={styles.titleContainer}>
          <Typography className={styles.titleText}>My Knitting Project</Typography>
          <Box className={styles.dateContainer}>
            <Box className={styles.startDateContainer}>
              <Typography className={styles.dateText}>시작일</Typography>
              <Controller 
                control={control}
                name={"selectedStartDate"}
                rules={{ required: "날짜를 선택해 주세요." }}
                render={({ field }) => 
                  <CustomDatePicker 
                    isConnectMobile={isConnectMobile}
                    minDate={new Date("1900-01-01")}
                    field={field}
                  />
                }
              />
            </Box>
            <Box className={styles.endDateContainer}>
              <Typography className={styles.dateText}>종료일</Typography>
              <Controller 
                control={control}
                name={"selectedEndDate"}
                render={({ field }) => 
                  <CustomDatePicker 
                    isConnectMobile={isConnectMobile}
                    minDate={watchedSelectedStartDate}
                    field={field}
                  />
                }
              />
            </Box>
          </Box>
        </Box>
        <Box className={styles.actionContainer}>
          <Button variant={"contained"} color={"success"} className={styles.saveButton} onClick={handleSubmit(onUpdateSubmit, onUpdateError)}>수정</Button>
          <Button variant={"contained"} color={"error"} onClick={onDeleteClick}>삭제</Button>
          <Button variant={"contained"} className={styles.cancelButton} onClick={onCancelClick}>취소</Button>
        </Box>
        <Grid className={styles.contentsGridContainer} gap={2} container>
          <Grid size={{ xs: 12, sm: 5.8 }}>
            <Box className={styles.patternContainer}>
              <Typography className={styles.contentsTitleText}>도안 정보</Typography>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>도안이름/크기</Typography>
                <Controller 
                  control={control}
                  name={"patternNameSize"}
                  rules={{
                    required: "도안이름/크기를 입력해 주세요.", maxLength: 100,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "도안이름/크기를 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 100 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>디자이너</Typography>
                <Controller 
                  control={control}
                  name={"designer"}
                  rules={{
                    required: "디자이너를 입력해 주세요.", maxLength: 30,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "디자이너를 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 30 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>(원작)실</Typography>
                <Controller 
                  control={control}
                  name={"originYarn"}
                  rules={{
                    required: "(원작)실을 입력해 주세요.", maxLength: 30,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "(원작)실을 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 30 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>(원작)게이지</Typography>
                <Controller 
                  control={control}
                  name={"originGauge"}
                  rules={{
                    required: "(원작)게이지를 입력해 주세요.", maxLength: 10,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "(원작)게이지를 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 10 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>(원작)바늘크기</Typography>
                <Controller 
                  control={control}
                  name={"originNeedleSize"}
                  rules={{
                    required: "(원작)바늘크기를 입력해 주세요.", maxLength: 10,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "(원작)바늘크기를 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 10 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>(원작)실 사용량</Typography>
                <Controller 
                  control={control}
                  name={"originYardage"}
                  rules={{
                    required: "(원작)실 사용량을 입력해 주세요.", maxLength: 10,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "(원작)실 사용량을 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 10 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                { patternImageUrl ? (
                  <Box {...onPatternImageLongClick(data?.patternImage?.id)}>
                    <ExternalImage 
                      image={patternImageUrl} 
                      alt={"pattern image"}
                      width={"fit-content"}
                    />
                  </Box>
                ) : (
                  <>
                    <InputBase 
                      type={"file"}
                      inputProps={{ accept: "image/*" }}
                      onChange={onPatternImageChange}
                    />
                    { patternPreview && (
                      <Box className={styles.previewContainer}>
                        <Image 
                          src={patternPreview} 
                          alt={"pattern image"} 
                          layout={"fill"}
                          unoptimized
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
            <Box className={styles.yarnAndNeedleContainer}>
              <Typography className={styles.contentsTitleText}>실/바늘</Typography>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>실</Typography>
                <Controller 
                  control={control}
                  name={"yarn"}
                  rules={{
                    required: "실을 입력해 주세요.", maxLength: 30,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "실을 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 30 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>바늘</Typography>
                <Controller 
                  control={control}
                  name={"needles"}
                  rules={{
                    required: "바늘을 입력해 주세요.", maxLength: 30,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "바늘을 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 30 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>게이지</Typography>
                <Controller 
                  control={control}
                  name={"gauge"}
                  rules={{
                    required: "게이지를 입력해 주세요.", maxLength: 10,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "게이지를 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 10 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                <Typography className={styles.contentsInputText}>실 사용량</Typography>
                <Controller 
                  control={control}
                  name={"yardage"}
                  rules={{
                    required: "실 사용량을 입력해 주세요.", maxLength: 10,
                    validate: {
                      noWhiteSpace: (value) => value.trim() !== "" || "실 사용량을 입력해 주세요."
                    }
                  }}
                  render={({ field }) => 
                    <TextField 
                      { ...field }
                      variant={"outlined"}
                      size={"small"}
                      slotProps={{ htmlInput: { maxLength: 10 } }}
                      inputRef={(element) => field.ref(element)}
                      fullWidth
                    />
                  }
                />
              </Box>
              <Box className={styles.contentsInputContainer}>
                { yarnNeedleImageUrl ? (
                  <Box {...onYarnNeedleImageLongClick(data?.yarnNeedleImage?.id)}>
                    <ExternalImage 
                      image={yarnNeedleImageUrl} 
                      alt={"yarn needle image"}
                      width={"fit-content"}
                    /> 
                  </Box>
                ) : (
                  <>
                    <InputBase 
                      type={"file"}
                      inputProps={{ accept: "image/*" }}
                      onChange={onYarnNeedleImageChange}
                    />
                    { yarnNeedlePreview && (
                      <Box className={styles.previewContainer}>
                        <Image 
                          src={yarnNeedlePreview} 
                          alt={"yarn needle image"} 
                          layout={"fill"}
                          unoptimized
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 5.8 }} className={styles.contentsGrid}>
            <Typography className={classNames([styles.contentsTitleText], [styles.noBorder])}>내용.</Typography>
            <Box className={styles.contentsFilesContainer}>
              { data?.patternFile ? (
                <Typography>도안(O)</Typography>
              ) : (
                <Box className={styles.patternFileContainer}>
                  <Typography>도안</Typography>
                  <InputBase 
                    type={"file"}
                    inputProps={{ accept: "application/pdf" }}
                    onChange={onPatternPdfChange}
                  />
                </Box>
              )}
              <Box>
                <Typography>사진</Typography>
                <InputBase 
                  type={"file"}
                  inputProps={{ accept: "image/*", multiple: true }}
                  onChange={onContentsImageChange}
                />
              </Box>
            </Box>
            <Box className={styles.contentsAndPictureContainer}>
              <Controller 
                control={control}
                name={"contents"}
                render={({ field }) => 
                  <TextField 
                    { ...field }
                    variant={"outlined"}
                    size={"small"}
                    rows={18}
                    inputRef={(element) => field.ref(element)}
                    className={classNames([styles.contentsInput], {[styles.half]: data && data.pictures.length > 0 })}
                    multiline
                    fullWidth
                  />
                }
              />
              { data && data.pictures.length > 0 &&
                <Slider
                  arrows={false}
                  infinite={false}
                  slidesToShow={1}
                  className={styles.pictureSlider}
                >
                  { data.pictures.map((picture) => 
                    <Box key={picture.id} {...onPictureLongClick(picture.id)}>
                      <ExternalImage 
                        image={`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/v1/knitting/picture/preview?id=${picture.id}`} 
                        alt={"picture image"}
                        width={"fit-content"}
                      />
                    </Box>
                  )}
                </Slider>
              }
            </Box>
          </Grid>
        </Grid>
      </Box>
      { fileUploadEnabled ? 
        <FileProgressing open={progressOpen} progress={progress} /> 
        : <Loading open={readIsLoading || deletePatternImageIsLoading || deleteYarnNeedleImageIsLoading || deletePictureIsLoading || updateIsLoading || deleteIsLoading} /> 
      }
      <ToastContainer position={"top-center"}/>
    </>
  )
}

export const getServerSideProps = async ({ query }: { query: { id?: string } }) => {
  const id = query.id ? parseInt(query.id) : 0

  return { props: { id } }
}
export default Update
