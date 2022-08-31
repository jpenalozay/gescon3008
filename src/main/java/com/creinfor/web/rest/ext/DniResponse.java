package com.creinfor.web.rest.ext;

import java.io.Serializable;
import java.util.Map;

public class DniResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    boolean success;

    Map<String, Object> data;

    public DniResponse() {}

    public boolean isSuccess() {
        return this.success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Map<String, Object> getData() {
        return this.data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
