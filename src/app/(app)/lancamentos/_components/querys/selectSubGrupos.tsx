
import { SelectSubGrupos } from "@/app/(app)/actions/selectActions";
import { useLancamentoContext } from "../contextLancamentoProvider"
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { tySelects } from "@/types/types";
import { useQuery} from 'react-query';
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";

interface Props {
  pai: string;
}

export default function ComboSubGrupos ({pai}: Props) { 
  const { grupoId, formGrupoId,
          subGrupoId, setSubGrupoId,
          formSubGrupoId, setFormSubGrupoId
  } = useLancamentoContext();

  //Tratamento para o pai do componente
  let padraoGrupoId: number = 0;
  let valorDefault: string = "";
  if(pai === "Filtros"){
    padraoGrupoId = grupoId;
    valorDefault = subGrupoId.toString();
  }
  if(pai === "Form"){
    padraoGrupoId = formGrupoId;
    valorDefault = formSubGrupoId.toString();
  }
  

  //Carrega os Orcamentos
  const { data, isLoading, refetch } = useQuery( ["listaSubGrupos", padraoGrupoId], async () => {
    const response:tySelects[] = await SelectSubGrupos(padraoGrupoId);
    //setListaGrupos(response);
    return response;
  })

  if(isLoading){
    return(
      <div>
        Carregando...
      </div>
    )
  }

  const onChange = async (value: string) =>{
    //Tratamento conforme Pai
    if(pai === "Filtros"){
      setSubGrupoId(Number(value));
    }
    if(pai === "Form"){
      setFormSubGrupoId(Number(value));
    }
    return true
  }

  return(
    <div>
      <Select defaultValue={valorDefault} onValueChange={onChange}>
        <SelectTrigger className="w-full text-sky-800 border-2">
          <SelectValue placeholder="Selecione a conta" />
        </SelectTrigger>
        <SelectContent className="border-2 border-sky-900 p-0 m-0">
          <SelectGroup className="bg-white text-sky-900">
            <SelectItem className="bg-sky-100  text-sky-900"  key={0} value={"0"}>Todos...</SelectItem>
            { data?.map((item, index)=>(
              <SelectItem className="bg-sky-100  text-sky-900"  key={index} value={item.id?.toString() || ""}>{item.nome}</SelectItem>
            )

            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )

}