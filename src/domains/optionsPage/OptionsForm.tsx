import React, {
  useCallback,
  FormEventHandler,
  ChangeEventHandler,
  useState,
} from "react";
import styles from "./OptionsForm.module.css";
import { ExtensionOptions } from "../optionsManager/types";
import {
  getExtensionOptions,
  setExtensionOptions,
} from "../optionsManager/client";

function useFormData() {
  const [data, setData] = useState(getExtensionOptions());

  const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { target } = event;
      setData({ ...data, [target.name]: target.value });
    },
    [data]
  );

  return { data, onInputChange };
}

function useOnSubmit(
  data: ExtensionOptions,
  setSuccess: (v: boolean) => void,
  setErrorMessage: (v: string) => void
) {
  return useCallback<FormEventHandler>(
    async (event) => {
      event.preventDefault();
      setSuccess(false);
      setErrorMessage("");
      try {
        await setExtensionOptions(data);
        setSuccess(true);
      } catch (error) {
        setErrorMessage(error.message ?? "Unknown error");
      }
    },
    [...arguments]
  );
}

function useOptionsForm() {
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { data, onInputChange } = useFormData();
  const onSubmit = useOnSubmit(data, setSuccess, setErrorMessage);

  return { data, onInputChange, onSubmit, success, errorMessage };
}

export default function OptionsForm() {
  const {
    data,
    onInputChange,
    onSubmit,
    success,
    errorMessage,
  } = useOptionsForm();

  return (
    <form onSubmit={onSubmit}>
      <h2>Jenkins</h2>
      <div>
        <label>
          <span>Match Pattern Url </span>
          <input
            type="text"
            name="jenkinsDomain"
            className={styles.input}
            placeholder="https://example.com"
            value={data.jenkinsDomain}
            onChange={onInputChange}
          />
        </label>
      </div>
      <div>
        <button type="submit">Submit</button>
      </div>
      {success && <div className={styles.success}>Successfully saved!</div>}
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    </form>
  );
}
