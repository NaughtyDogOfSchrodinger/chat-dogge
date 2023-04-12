import { CustomOpenAIKeyForm } from '@/components/CustomOpenAIKeyForm'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Purchase } from '@/components/Purchase'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const Usage = () => {
  return (
    <div>
      <Header />
      <main>
        <Purchase />
        <CustomOpenAIKeyForm />
      </main>
      <Footer />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  }
}

export default Usage
