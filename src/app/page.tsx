"use client";
import { useZupass } from "@/zupass";
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { useZupassPopupMessages } from '../PassportPopup';
import { OuterContainer, PageContainer, Title } from "../components/Zuzagora";
import { Button } from "../components/core/Button";
import { RippleLoader } from "../components/core/RippleLoader";
import { InputParams } from '../types';
import { authenticate } from "../utils/authenticate";
import { validateSSO } from "../utils/validateSSO";

export default function Home() {
  const [loading, setloading] = useState(true)
  const [inputParams, setInputParams] = useState<InputParams | null>(null)
  const { login } = useZupass();
  const [pcdStr] = useZupassPopupMessages();

  const searchParams = useSearchParams()

  useEffect(() => {
    async function startValidation() {
      try {
        const params = await getParams(searchParams);
        if (searchParams) {
          const response = await validateSSO(params?.sso, params?.sig);
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

  useEffect(() => {
    (async () => {
      if (pcdStr) {
        processProof(pcdStr)
      }
    })();
  }, [pcdStr]);

  const loginHandler = async () => {
    setloading(true)
    await login(inputParams)
    setloading(false)
  }

  const processProof = async (proof: string) => {
    const parsedProof = JSON.parse(proof);
    parsedProof.pcd = JSON.parse(parsedProof.pcd);

    const response = await authenticate(pcdStr)
    const returnSSOURL = inputParams?.return_sso_url;  // This is an example; use the actual return_sso_url from your payload.

    // Return
    if (response && returnSSOURL) {
      const redirectURL = `${returnSSOURL}?sso=${response?.encodedPayload}&sig=${response?.sig}`;
      window.location.href = redirectURL;
    }
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
          <Button onClick={loginHandler}>Sign In</Button>
        </PageContainer>
      </OuterContainer>
  );
}


const getParams = (searchParams: ReadonlyURLSearchParams | null) => {
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