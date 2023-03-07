import { useCallback, useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  TextField,
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ProductsCard() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [script, setScript] = useState('');
  const fetch = useAuthenticatedFetch();

  const handleScriptChange = useCallback((value) => setScript(value), []);

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handlePopulate = async () => {
    setIsLoading(true);
    const response = await fetch("/api/products/create");

    if (response.ok) {
      await refetchProductCount();
      setToastProps({ content: "5 products created!" });
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error creating products",
        error: true,
      });
    }
  };

  return (
    <>
      {toastMarkup}
      <Card
        title="Userwerk Application"
        sectioned
        primaryFooterAction={{
          content: "Connect",
          onAction: handlePopulate,
          loading: isLoading,
        }}
      >
        <TextContainer spacing="loose">
          <p>
              This application allows you to connect additional scripts to your store after payment.
              To connect a script to your store you must enter the link to your script below
          </p>
            <TextField
                value={script}
                onChange={handleScriptChange}
                autoComplete="script"
                label="Link to script"
                type="script"
                helpText={
                    <span>
              We’ll connect this script after paying for the order in your store
            </span>
                }
            />
          {/*<Heading element="h4">*/}
          {/*  TOTAL PRODUCTS*/}
          {/*  <DisplayText size="medium">*/}
          {/*    <TextStyle variation="strong">*/}
          {/*      {isLoadingCount ? "-" : data.count}*/}
          {/*    </TextStyle>*/}
          {/*  </DisplayText>*/}
          {/*</Heading>*/}
        </TextContainer>
      </Card>
    </>
  );
}
