package br.com.altis.cadastroclientes.controller;

import br.com.altis.cadastroclientes.dto.dashboard.DashboardStatsDTO;
import br.com.altis.cadastroclientes.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDTO stats() {
        return dashboardService.stats();
    }
}
