package com.creinfor.domain.ext;

public class LongStringPair {

    private Long key;

    private String value;

    public LongStringPair() {}

    public LongStringPair(Long key, String value) {
        this.key = key;
        this.value = value;
    }

    public Long getKey() {
        return this.key;
    }

    public void setKey(Long key) {
        this.key = key;
    }

    public String getValue() {
        return this.value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
