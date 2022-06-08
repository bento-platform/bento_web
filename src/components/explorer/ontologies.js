import React from "react";
import { EM_DASH } from "../../constants";

export const renderOntologyTerm = (term) =>
    term ? (
        <span>
            {term.label} ({term.id})
        </span>
    ) : (
        EM_DASH
    );
