import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

export function Pattern() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon-sm">
          <ArrowLeftIcon aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm">
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
        <Button variant="outline" size="icon-sm">
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  )
}