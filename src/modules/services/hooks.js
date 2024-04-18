import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBentoServices, fetchServices } from "@/modules/services/actions";

export const useBentoServices = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchBentoServices()).catch((err) => console.error(err));
    }, [dispatch]);
    return useSelector((state) => state.bentoServices);
};

export const useBentoService = (kind) => {
    const bentoServices = useBentoServices();
    return bentoServices.itemsByKind[kind];
};

export const useServices = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchServices()).catch((err) => console.error(err));
    }, [dispatch]);
    return useSelector((state) => state.services);  // From service registry; service-info style
};

export const useService = (kind) => {
    const services = useServices();
    return services.itemsByKind[kind];
};
