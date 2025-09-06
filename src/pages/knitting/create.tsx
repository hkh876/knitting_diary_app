import CustomDatePicker from "@/components/CustomDatePicker"
import FileProgressing from "@/components/FileProgressing"
import Loading from "@/components/Loading"
import { EmptyDto } from "@/dtos/CommonDto"
import { ErrorCode } from "@/errors/ErrorCode"
import { KnittingCreateForm } from "@/forms/KnittingForm"
import { ErrorRes, usePostQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/knitting/Create.module.css"
import { isValidDate } from "@/utils/Utils"
import { Box, Button, Grid, InputBase, TextField, Typography } from "@mui/material"
import { AxiosProgressEvent } from "axios"
import classNames from "classnames"
import { format } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/router"
import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form"
import { toast, ToastContainer } from "react-toastify"

const Create = () => {
  // router
  const router = useRouter()

  // states
  const [isConnectMobile, setIsConnectMobile] = useState(false)
  const [patternPreview, setPatternPreview] = useState<string>("")
  const [yarnNeedlePreview, setYarnNeedlePreview] = useState<string>("")
  const [fileUploadEnabled, setFileUploadEnabled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressOpen, setProgressOpen] = useState(false)

  // query
  const onResSuccess = () => {
    toast.success(
      "저장 되었습니다.",
      { onClose: () => router.back(), autoClose: 1000 }
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

  const { mutate, isLoading } = usePostQueryEx<KnittingCreateForm, EmptyDto>({
    url: "/api/v1/knitting/create",
    contentType: "multipart/form-data",
    onSuccess: onResSuccess,
    onError: onResError,
    onProgress: onProgress
  })

  // forms
  const { control, handleSubmit, setValue, watch } = useForm<KnittingCreateForm>({
    defaultValues: {
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

  const onCreateSubmit: SubmitHandler<KnittingCreateForm> = (formData) => {
    if (confirm("저장 하시겠습니까?")) {
      if (formData.patternImageFile || formData.yarnNeedleImageFile || formData.patternFile 
        || (formData.attachFiles && formData.attachFiles.length > 0)) {
          setFileUploadEnabled(true)
          setProgressOpen(true)
      } else {
        setFileUploadEnabled(false)
        setProgressOpen(false)
      }
      
      mutate(formData)
    }
  }

  const onCreateError: SubmitErrorHandler<KnittingCreateForm> = (errors) => {
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

  const onCancelClick = () => {
    router.back()
  }

  // values
  const watchedSelectedStartDate = watch("selectedStartDate")
  const watchedSelectedEndDate = watch("selectedEndDate")
    
  useEffect(() => {
    setIsConnectMobile(isMobile)
  }, [])

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
      <Box className={styles.projectCreateContainer}>
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
          <Button variant={"contained"} color={"success"} className={styles.saveButton} onClick={handleSubmit(onCreateSubmit, onCreateError)}>저장</Button>
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
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 5.8 }} className={styles.contentsGrid}>
            <Typography className={classNames([styles.contentsTitleText], [styles.noBorder])}>내용.</Typography>
            <Box className={styles.contentsFilesContainer}>
              <Box className={styles.patternFileContainer}>
                <Typography>도안</Typography>
                <InputBase 
                  type={"file"}
                  inputProps={{ accept: "application/pdf" }}
                  onChange={onPatternPdfChange}
                />
              </Box>
              <Box>
                <Typography>사진</Typography>
                <InputBase 
                  type={"file"}
                  inputProps={{ accept: "image/*", multiple: true }}
                  onChange={onContentsImageChange}
                />
              </Box>
            </Box>
            <Controller 
              control={control}
              name={"contents"}
              render={({ field }) => 
                <TextField 
                  { ...field }
                  variant={"outlined"}
                  size={"small"}
                  rows={12}
                  inputRef={(element) => field.ref(element)}
                  className={styles.contentsInput}
                  multiline
                  fullWidth
                />
              }
            />
          </Grid>
        </Grid>
      </Box>
      { fileUploadEnabled ? <FileProgressing open={progressOpen} progress={progress} /> : <Loading open={isLoading} /> }
      <ToastContainer position={"top-center"}/>
    </>
  )
}

export default Create