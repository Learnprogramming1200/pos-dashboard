"use client"

import React, { useEffect, useState } from "react"
import { Country, State, City } from "country-state-city"
import { FormDropdown, FormOption } from "@/components/ui/FormDropdown"

interface CountryStateCitySelectorProps {
    readonly selectedCountry?: string
    readonly onCountryChange: (value: string) => void
    readonly selectedState?: string
    readonly onStateChange: (value: string) => void
    readonly selectedCity?: string
    readonly onCityChange: (value: string) => void
    readonly countryError?: string
    readonly stateError?: string
    readonly cityError?: string
}

export function CountryStateCitySelector({
    selectedCountry,
    onCountryChange,
    selectedState,
    onStateChange,
    selectedCity,
    onCityChange,
    countryError,
    stateError,
    cityError,
}: CountryStateCitySelectorProps) {
    const [countries, setCountries] = useState<any[]>([])
    const [states, setStates] = useState<any[]>([])
    const [cities, setCities] = useState<any[]>([])

    useEffect(() => {
        setCountries(Country.getAllCountries())
    }, [])

    useEffect(() => {
        if (selectedCountry) {
            setStates(State.getStatesOfCountry(selectedCountry))
        } else {
            setStates([])
        }
    }, [selectedCountry])

    useEffect(() => {
        if (selectedCountry && selectedState) {
            setCities(City.getCitiesOfState(selectedCountry, selectedState))
        } else {
            setCities([])
        }
    }, [selectedCountry, selectedState])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <span className="block mb-1">Country</span>
                    <FormDropdown
                        value={selectedCountry || ""}
                        onChange={(e) => onCountryChange(e.target.value)}
                        placeholder="Select Country"
                    >
                        {countries.map((country) => (
                            <FormOption key={country.isoCode} value={country.isoCode}>
                                {country.name}
                            </FormOption>
                        ))}
                    </FormDropdown>
                </label>
                {countryError && (
                    <p className="mt-1 text-sm text-red-500">{countryError}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <span className="block mb-1">State</span>
                    <FormDropdown
                        value={selectedState || ""}
                        onChange={(e) => onStateChange(e.target.value)}
                        placeholder="Select State"
                        disabled={!selectedCountry}
                    >
                        {states.map((state) => (
                            <FormOption key={state.isoCode} value={state.isoCode}>
                                {state.name}
                            </FormOption>
                        ))}
                    </FormDropdown>
                </label>
                {stateError && (
                    <p className="mt-1 text-sm text-red-500">{stateError}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <span className="block mb-1">City</span>
                    <FormDropdown
                        value={selectedCity || ""}
                        onChange={(e) => onCityChange(e.target.value)}
                        placeholder="Select City"
                        disabled={!selectedState}
                    >
                        {cities.map((city) => (
                            <FormOption key={city.name} value={city.name}>
                                {city.name}
                            </FormOption>
                        ))}
                    </FormDropdown>
                </label>
                {cityError && (
                    <p className="mt-1 text-sm text-red-500">{cityError}</p>
                )}
            </div>
        </div>
    )
}
