import { CustomOpenAIKeyForm } from '@/components/CustomOpenAIKeyForm'
import { Purchase } from '@/components/Purchase'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const Usage = () => {
  return (
    <div>
      <main>
        <Purchase />
        <CustomOpenAIKeyForm />
      </main>
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
