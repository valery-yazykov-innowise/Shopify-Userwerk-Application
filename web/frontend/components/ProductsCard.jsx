import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  TextField,
  Form,
  ChoiceList,
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import axios from "axios";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useParams } from "react-router-dom";

export function ProductsCard() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [script, setScript] = useState('');
  const [selected, setSelected] = useState('');
  const fetch = useAuthenticatedFetch();

  const handleScriptTextChange = useCallback((value) => setScript(value), []);
  const handleOptionChange = useCallback((value) => setSelected(value), []);

  const { data, isLoading: isLoadingCount, } = useAppQuery({
    url: "/api/script/data",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });
  
  useEffect( () => {
      if (data) {
          setSelected(data['status']);
          setScript(data['script_link']);
      }
      return script
  }, [script, data])

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handlePopulate = async () => {
    setIsLoading(true);
      const response = await fetch("/api/script/create", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({ script: script, status: selected }),
      });

      if (response.ok) {
          // await refetchProductCount();
          setToastProps({ content: "Script tag added!" });
          setIsLoading(false);
      } else {
          setIsLoading(false);
          setToastProps({
              content: "There was an error adding script tag",
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
                onChange={handleScriptTextChange}
                autoComplete="script"
                label="Link to script"
                type="script"
                helpText={
                    <span>
              We’ll connect this script after paying for the order in your store
            </span>
                }
            />
            <ChoiceList
                title="Enable script tag"
                choices={[
                    {label: 'Yes', value: 'Yes'},
                    {label: 'No', value: 'No'},
                ]}
                selected={selected}
                onChange={handleOptionChange}
            />
        </TextContainer>
      </Card>
    </>
  );
}
