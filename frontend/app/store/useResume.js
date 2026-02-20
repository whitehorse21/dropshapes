import useResumeStore from "./resumeStore"

export const useResume =()=> {
    const {loading, error} = useResumeStore()
    return { loading, error}
}