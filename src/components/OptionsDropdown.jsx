import React from "react"
import { Select } from "@chakra-ui/react"

export const OptionDropdown = ({ optionsArray, placeholder, id }) => {
    return (
        <Select placeholder={placeholder} id={id} variant="fushed">
            {optionsArray.map((option, index) => (
                <option value={option.value} key={index}>
                    {option.name}
                </option>
            ))}
        </Select>
    )
}
