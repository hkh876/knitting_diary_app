
const Home = () => {
  return (
    <></>
  )
}

export const getServerSideProps = async () => {
  return { redirect: { destination: "/knitting/list?page=1&size=20", permanent: false } }
}
export default Home