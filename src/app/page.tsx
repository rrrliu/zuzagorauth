"use client";
import { useZupass } from "@/zupass";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

import { OuterContainer, PageContainer, Title } from "../components/Zuzagora";
import { Button } from "../components/core/Button";
import { RippleLoader } from "../components/core/RippleLoader";
// import { generateSignature } from "../utils/generateSignature";
import { validateSSO } from "../utils/validateSSO";

export default function Home() {

  const [loading, setloading] = useState(true)
  const [inputParams, setInputParams] = useState(null)
  
  const { login, ticketData } = useZupass();
  console.log("🚀 ~ file: page.tsx:18 ~ Home ~ ticketData:", ticketData)

  const searchParams = useSearchParams()

  useEffect(() => {
    async function startValidation() {
      try {
        const params = await getParams();
        if (searchParams) {
          const response = await validateSSO(params?.sso, params?.sig, window.location.origin);
          // TODO: trigger alert if it's not valid
          if (response?.isValid) {
            setloading(false);
            setInputParams({...params, ...response})
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    
    startValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


// useEffect(() => {
// TODO: start processing
//   const { response } = await generateSignature(urlPayload, origin);
// }, [])


  const getParams = () => {
    // Initialize the final object
    const finalObject: any = {};
    // Check for 'sso' parameter
    if (searchParams?.has('sso')) {
      const ssoString = searchParams?.get('sso')
      finalObject.sso = ssoString;
    }

    // Check for 'sig' parameter
    if (searchParams?.has('sig')) {
      const sigString = searchParams?.get('sig');
      finalObject.sig = sigString;
    }
    return finalObject;
  }

  if (loading) {
    return (
      <OuterContainer>
        <RippleLoader />
      </OuterContainer>
    )
  }
    
  return (
      <OuterContainer>
        <PageContainer>
          <Title>Welcome to Zuzagora!</Title>
          {/* <Subtitle>a Zupass forum</Subtitle> */}
          <Button onClick={() => login(inputParams)}>Sign In</Button>
        </PageContainer>
      </OuterContainer>
  );
}
